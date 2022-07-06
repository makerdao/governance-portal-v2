import { fetchJson } from 'lib/fetchJson';
import { localStorage } from 'modules/app/client/storage/localStorage';
import { useAccount } from 'modules/app/hooks/useAccount';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/comments';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { sign } from 'modules/web3/helpers/sign';
import { signTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useContracts } from 'modules/web3/hooks/useContracts';
import useTransactionsStore, {
  transactionsApi,
  transactionsSelectors
} from 'modules/web3/stores/transactions';
import { Transaction } from 'modules/web3/types/transaction';
import React, { ReactNode, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import shallow from 'zustand/shallow';
import { Ballot, BallotVote } from '../types/ballot';
import { parsePollOptions } from 'modules/polling/helpers/parsePollOptions';
import logger from 'lib/logger';
import { ethers } from 'ethers';
import PollingContractAbi from 'modules/contracts/abis/arbitrumTestnet/polling.json';
import { ContractTransaction } from 'ethers';
import { GaslessNetworks } from 'modules/web3/constants/networks';

type BallotSteps = 'initial' | 'method-select' | 'sign-comments' | 'confirm' | 'submitting';
type BallotSubmissionMethod = 'standard' | 'gasless';

interface ContextProps {
  ballot: Ballot;
  transaction?: Transaction;
  previousBallot: Ballot;
  updateVoteFromBallot: (pollId: number, ballotVote: Partial<BallotVote>) => void;
  removeVoteFromBallot: (pollId: number) => void;
  addVoteToBallot: (pollId: number, ballotVote: BallotVote) => void;
  submitBallot: () => void;
  submitBallotGasless: () => void;
  clearBallot: () => void;
  clearTransaction: () => void;
  isPollOnBallot: (pollId: number) => boolean;
  ballotCount: number;
  signComments: () => void;
  commentsSignature: string;
  commentsCount: number;
  setStep: (step: string) => void;
  ballotStep: BallotSteps;
  submissionMethod: BallotSubmissionMethod | null;
  handleCommentsStep: (method: BallotSubmissionMethod) => void;
}

export const BallotContext = React.createContext<ContextProps>({
  ballot: {},
  previousBallot: {},
  updateVoteFromBallot: (pollId: number, ballotVote: Partial<BallotVote>) => null,
  addVoteToBallot: (pollId: number, ballotVote: BallotVote) => null,
  clearBallot: () => null,
  clearTransaction: () => null,
  removeVoteFromBallot: (pollId: number) => null,
  submitBallot: () => null,
  submitBallotGasless: () => null,
  isPollOnBallot: (pollId: number) => false,
  ballotCount: 0,
  signComments: () => null,
  commentsSignature: '',
  commentsCount: 0,
  setStep: (step: BallotSteps) => null,
  ballotStep: 'initial',
  submissionMethod: null,
  handleCommentsStep: () => null
});

type PropTypes = {
  children: ReactNode;
};

export const BallotProvider = ({ children }: PropTypes): React.ReactElement => {
  // Current ballot
  const [ballot, setBallot] = useState<Ballot>({});
  // Used to track the active transaction
  const [txId, setTxId] = useState<string | null>(null);

  // Used to track the signature of the comments API call
  const [commentsSignature, setCommentSignature] = useState('');

  const [ballotStep, setBallotStep] = useState<BallotSteps>('initial');

  const [submissionMethod, setSubmissionMethod] = useState<BallotSubmissionMethod | null>(null);

  // Stores previous voted polls
  const [previousBallot, setPreviousBallot] = useState<Ballot>({});

  // Determines which address will be use to save the comments
  const { account, voteDelegateContract, voteDelegateContractAddress, voteProxyContractAddress } =
    useAccount();

  const accountToUse = voteDelegateContractAddress
    ? voteDelegateContractAddress
    : voteProxyContractAddress
    ? voteProxyContractAddress
    : account;

  const clearBallot = () => {
    setCommentSignature('');
    setBallot({});
    localStorage.set(`ballot-${network}-${account}`, JSON.stringify({}));
  };

  const loadBallotFromStorage = () => {
    const prevBallot = localStorage.get(`ballot-${network}-${account}`);
    if (prevBallot) {
      try {
        const parsed = JSON.parse(prevBallot);
        setBallot(parsed);
      } catch (e) {
        logger.error('loadBallotFromStorage: unable to load ballot from storage', e);
        // Do nothing
        setBallot({});
      }
    } else {
      setBallot({});
    }
  };

  const { network, library } = useActiveWeb3React();
  // Reset ballot on network change
  useEffect(() => {
    setPreviousBallot({});
    loadBallotFromStorage();
  }, [network, account]);

  // add vote to ballot

  const addVoteToBallot = (pollId: number, ballotVote: BallotVote) => {
    setTxId(null);
    setCommentSignature('');
    const newBallot = {
      ...ballot,
      [pollId]: ballotVote
    };
    setBallot(newBallot);

    localStorage.set(`ballot-${network}-${account}`, JSON.stringify(newBallot));
  };

  const removeVoteFromBallot = (pollId: number) => {
    setTxId(null);
    setCommentSignature('');

    const { [pollId]: pollToDelete, ...rest } = ballot;
    setBallot(rest);

    localStorage.set(`ballot-${network}-${account}`, JSON.stringify(rest));
  };

  const updateVoteFromBallot = (pollId: number, ballotVote: Partial<BallotVote>) => {
    setTxId(null);
    setCommentSignature('');
    const newBallot = {
      ...ballot,
      [pollId]: {
        ...ballot[pollId],
        ...ballotVote
      }
    };
    setBallot(newBallot);
    localStorage.set(`ballot-${network}-${account}`, JSON.stringify(newBallot));
  };

  // Helpers
  const isPollOnBallot = (pollId: number): boolean => {
    // Checks that the option voted is not null or undefined
    return ballot[pollId] && typeof ballot[pollId].option !== 'undefined' && ballot[pollId].option !== null;
  };

  // Comments signing
  const getComments = (): Partial<PollComment>[] => {
    return Object.keys(ballot)
      .filter(key => isPollOnBallot(parseInt(key)))
      .map(key => {
        return {
          pollId: parseInt(key),
          ...ballot[parseInt(key)]
        };
      })
      .filter(c => !!c.comment);
  };

  const commentsCount = getComments().length;

  const signComments = async () => {
    if (!account) {
      return;
    }

    const comments = getComments();

    const data = await fetchJson('/api/comments/nonce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: account.toLowerCase()
      })
    });

    const signature = comments.length > 0 ? await sign(account, data.nonce, library) : '';
    setCommentSignature(signature);
  };

  // Ballot submission
  const [track, transaction] = useTransactionsStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : undefined],
    shallow
  );

  const { polling } = useContracts();

  const trackPollVote = (
    voteTxCreator: () => Promise<ContractTransaction>,
    gaslessNetwork?: GaslessNetworks
  ) => {
    const txId = track(
      voteTxCreator,
      account,
      `Voting on ${Object.keys(ballot).length} poll${Object.keys(ballot).length > 1 ? 's': ''}`,
      {
        pending: txHash => {
          const comments = getComments();
          // if comment included, add to comments db
          if (comments.length > 0) {
            const commentsRequest: PollsCommentsRequestBody = {
              voterAddress: accountToUse || '',
              hotAddress: account || '',
              comments: comments,
              signedMessage: commentsSignature,
              txHash
            };

            fetchJson(`/api/comments/polling/add?network=${network}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(commentsRequest)
            }).catch(() => {
              logger.error('POST Polling Comments: failed to add comment');
              toast.error('Unable to store comments');
            });

            // Invalidate tally cache for each voted poll
            Object.keys(ballot).forEach(pollId => {
              setTimeout(() => {
                fetchJson(`/api/polling/tally/${pollId}/invalidate-cache?network=${network}`);
              }, 60000);
            });
          }
        },
        mined: (txId, txHash) => {
          // Set votes
          const votes = {};
          Object.keys(ballot).forEach(pollId => {
            votes[pollId] = ballot[pollId];
            votes[pollId].transactionHash = txHash;
          });

          setPreviousBallot({
            ...previousBallot,
            ...votes
          });
          clearBallot();
          transactionsApi.getState().setMessage(txId, `Voted on ${Object.keys(ballot).length} poll${Object.keys(ballot).length > 1 ? 's': ''}`);
        },
        error: () => {
          toast.error('Error submitting ballot');
        }
      },
      gaslessNetwork
    );
    setTxId(txId);
  };

  const submitBallot = () => {
    const pollIds: string[] = [];
    const pollOptions: string[] = [];

    setStep('submitting');

    Object.keys(ballot).forEach((key: string) => {
      if (isPollOnBallot(parseInt(key, 10))) {
        pollIds.push(key);
        pollOptions.push(ballot[key].option);
      }
    });

    const optionIds = parsePollOptions(pollOptions);

    const voteTxCreator = voteDelegateContract
      ? () => voteDelegateContract['votePoll(uint256[],uint256[])'](pollIds, optionIds)
      : // vote with array arguments can be used for single vote and multiple vote
        () => polling['vote(uint256[],uint256[])'](pollIds, optionIds);

    trackPollVote(voteTxCreator);
  };

  const submitBallotGasless = async () => {
    if (!account) {
      return;
    }

    const pollIds: string[] = [];
    const pollOptions: string[] = [];

    setStep('submitting');

    Object.keys(ballot).forEach((key: string) => {
      if (isPollOnBallot(parseInt(key, 10))) {
        pollIds.push(key);
        pollOptions.push(ballot[key].option);
      }
    });

    //TODO: make the url based on connected network (mainnet vs goerli)
    //also move alchemy key to env variable
    const provider = new ethers.providers.JsonRpcProvider(
      'https://arb-rinkeby.g.alchemy.com/v2/QKgfwJW4WeaxoD2b3iImXkHcT0vyCsic'
    );
    const pollingContract = new ethers.Contract(
      // arbitrum testnet polling address,
      // maybe we should use eth-sdk for this if it's supported
      '0xc5C7bC9f0F54f2F6c441A774Ef93aCf06cE3DfA3',
      PollingContractAbi,
      provider
    );
    const nonce = await pollingContract.nonces('0x14341f81dF14cA86E1420eC9e6Abd343Fb1c5bfC');
    const signatureValues = {
      voter: account.toLowerCase(),
      pollIds,
      optionIds: pollOptions,
      nonce: nonce.toNumber(),
      expiry: Math.trunc((Date.now() + 28800 * 1000) / 1000) //8 hour expiry
    };

    const signature = await signTypedBallotData(signatureValues, library, networkNameToChainId(network));
    fetchJson(`/api/polling/vote?network=${network}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...signatureValues, ...signature })
    }).then(res => {
      const voteTxCreator = () => provider.getTransaction(res.hash);
      //todo: get network name from a helper function that takes in current network
      trackPollVote(voteTxCreator, GaslessNetworks.ARBITRUMTESTNET);
    });
  };

  const setStep = (step: BallotSteps) => {
    setBallotStep(step);
  };

  const handleCommentsStep = (method: BallotSubmissionMethod) => {
    setSubmissionMethod(method);
    if (commentsCount > 0) {
      setStep('sign-comments');
    } else {
      setStep('confirm');
    }
  };
  const clearTransaction = () => {
    setTxId(null);
    setBallotStep('initial');
    setSubmissionMethod(null);
  };

  useEffect(() => {
    loadBallotFromStorage();
  }, []);

  return (
    <BallotContext.Provider
      value={{
        ballot,
        previousBallot,
        clearBallot,
        clearTransaction,
        addVoteToBallot,
        removeVoteFromBallot,
        updateVoteFromBallot,
        submitBallot,
        submitBallotGasless,
        transaction,
        isPollOnBallot,
        ballotCount: Object.keys(ballot).length,
        signComments,
        commentsSignature,
        commentsCount,
        setStep,
        ballotStep,
        submissionMethod,
        handleCommentsStep
      }}
    >
      {children}
    </BallotContext.Provider>
  );
};
