import { fetchJson } from 'lib/fetchJson';
import { localStorage } from 'modules/app/client/storage/localStorage';
import { useAccount } from 'modules/app/hooks/useAccount';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/comments';
import { sign } from 'modules/web3/helpers/sign';
import { signTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
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
import { GaslessNetworks, getGaslessNetwork, getGaslessProvider } from 'modules/web3/constants/networks';

type BallotSteps =
  | 'initial'
  | 'method-select'
  | 'sign-comments'
  | 'confirm'
  | 'submitting'
  | 'awaiting-relayer'
  | 'tx-pending'
  | 'tx-error';
type BallotSubmissionMethod = 'standard' | 'gasless';
import { getPollTallyCacheKey } from 'modules/cache/constants/cache-keys';
import { invalidateCache } from 'modules/cache/invalidateCache';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
  isPollOnBallot: (pollId: number) => boolean;
  ballotCount: number;
  signComments: () => void;
  commentsSignature: string;
  commentsCount: number;
  setStep: (step: BallotSteps) => void;
  ballotStep: BallotSteps;
  submissionMethod: BallotSubmissionMethod | null;
  handleCommentsStep: (method: BallotSubmissionMethod) => void;
  close: () => void;
}

export const BallotContext = React.createContext<ContextProps>({
  ballot: {},
  previousBallot: {},
  updateVoteFromBallot: (pollId: number, ballotVote: Partial<BallotVote>) => null,
  addVoteToBallot: (pollId: number, ballotVote: BallotVote) => null,
  clearBallot: () => null,
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
  handleCommentsStep: () => null,
  close: () => null
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
    localStorage.set(`ballot-${network}-${account}`, JSON.stringify({}), ONE_DAY_MS);
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

  const { network, provider } = useWeb3();
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

    localStorage.set(`ballot-${network}-${account}`, JSON.stringify(newBallot), ONE_DAY_MS);
  };

  const removeVoteFromBallot = (pollId: number) => {
    setTxId(null);
    setCommentSignature('');

    const { [pollId]: pollToDelete, ...rest } = ballot;
    setBallot(rest);

    localStorage.set(`ballot-${network}-${account}`, JSON.stringify(rest), ONE_DAY_MS);
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
    localStorage.set(`ballot-${network}-${account}`, JSON.stringify(newBallot), ONE_DAY_MS);
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
    if (!account || !provider) {
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

    const signature = comments.length > 0 ? await sign(account, data.nonce, provider) : '';
    setCommentSignature(signature);
    setStep('confirm');
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
      `Voting on ${Object.keys(ballot).length} poll${Object.keys(ballot).length > 1 ? 's' : ''}`,
      {
        pending: txHash => {
          setStep('tx-pending');
          const comments = getComments();
          // if comment included, add to comments db
          if (comments.length > 0) {
            const commentsRequest: PollsCommentsRequestBody = {
              voterAddress: accountToUse || '',
              hotAddress: account || '',
              comments: comments,
              signedMessage: commentsSignature,
              txHash,
              gaslessNetwork
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

            //todo: have this happen after tx is mined? and also including when there's no comments
            // Invalidate tally cache for each voted poll
            Object.keys(ballot).forEach(pollId => {
              setTimeout(() => {
                invalidateCache(getPollTallyCacheKey(parseInt(pollId)), network);
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
          transactionsApi
            .getState()
            .setMessage(
              txId,
              `Voted on ${Object.keys(ballot).length} poll${Object.keys(ballot).length > 1 ? 's' : ''}`
            );
        },
        error: () => {
          setStep('tx-error');
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

    const provider = getGaslessProvider(network);
    const pollingContract = new ethers.Contract(
      // arbitrum testnet polling address,
      // maybe we should use eth-sdk for this if it's supported
      '0x4d196378e636D22766d6A9C6C6f4F32AD3ECB050',
      PollingContractAbi,
      provider
    );

    const nonce = await pollingContract.nonces(account);
    const signatureValues = {
      voter: account.toLowerCase(),
      pollIds,
      optionIds: pollOptions,
      nonce: nonce.toNumber(),
      expiry: Math.trunc((Date.now() + 28800 * 1000) / 1000) //8 hour expiry
    };
    const signature = await signTypedBallotData(signatureValues, library, network);
    if (signature) {
      setStep('awaiting-relayer');
    } else {
      setStep('tx-error');
    }
    fetchJson(`/api/polling/vote?network=${network}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...signatureValues, signature, network })
    })
      .then(res => {
        const voteTxCreator = () => provider.getTransaction(res.hash);
        trackPollVote(voteTxCreator, getGaslessNetwork(network));
      })
      .catch(error => {
        toast.error(error);
        setStep('tx-error');
      });
  };

  const setStep = (step: BallotSteps) => {
    setBallotStep(step);
  };

  const close = () => {
    setCommentSignature('');
    setTxId(null);
    setStep('initial');
    setSubmissionMethod(null);
  };

  const handleCommentsStep = (method: BallotSubmissionMethod) => {
    setSubmissionMethod(method);
    if (commentsCount > 0) {
      setStep('sign-comments');
    } else {
      setStep('confirm');
    }
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
        handleCommentsStep,
        close
      }}
    >
      {children}
    </BallotContext.Provider>
  );
};
