import { fetchJson } from 'lib/fetchJson';
import { localStorage } from 'modules/app/client/storage/localStorage';
import { useAccount } from 'modules/app/hooks/useAccount';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/comments';
import { sign } from 'modules/web3/helpers/sign';
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

type BallotSteps = 'initial' | 'method-select' | 'submitting';

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
  ballotStep: 'initial'
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
        console.log(e);
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

    const voteTxCreator = voteDelegateContract
      ? () => voteDelegateContract['votePoll(uint256[],uint256[])'](pollIds, pollOptions)
      : () => polling['vote(uint256[],uint256[])'](pollIds, pollOptions);

    const txId = track(voteTxCreator, account, `Voting on ${Object.keys(ballot).length} polls`, {
      pending: txHash => {
        // if comment included, add to comments db
        if (getComments().length > 0) {
          const commentsRequest: PollsCommentsRequestBody = {
            voterAddress: accountToUse || '',
            hotAddress: account || '',
            comments: getComments(),
            signedMessage: commentsSignature,
            txHash
          };

          fetchJson(`/api/comments/polling/add?network=${network}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentsRequest)
          })
            .then(() => {
              // console.log('comment successfully added');
            })
            .catch(() => {
              console.error('failed to add comment');
              toast.error('Unable to store comments');
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
        transactionsApi.getState().setMessage(txId, `Voted on ${Object.keys(ballot).length} polls`);
      },
      error: () => {
        toast.error('Error submitting ballot');
      }
    });
    setTxId(txId);
  };

  const submitBallotGasless = () => {
    const pollIds: string[] = [];
    const pollOptions: string[] = [];

    setStep('submitting');

    Object.keys(ballot).forEach((key: string) => {
      if (isPollOnBallot(parseInt(key, 10))) {
        pollIds.push(key);
        pollOptions.push(ballot[key].option);
      }
    });

    fetchJson(`/api/polling/vote?network=${network}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pollIds, pollOptions, signature: '' })
    }).then(res => {
      if (getComments().length > 0) {
        const commentsRequest: PollsCommentsRequestBody = {
          voterAddress: accountToUse || '',
          hotAddress: account || '',
          comments: getComments(),
          signedMessage: commentsSignature,
          txHash: res.txHash
        };

        fetchJson(`/api/comments/polling/add?network=${network}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(commentsRequest)
        })
          .then(() => {
            // console.log('comment successfully added');
          })
          .catch(() => {
            console.error('failed to add comment');
            toast.error('Unable to store comments');
          });
      }
    });
  };

  const setStep = (step: BallotSteps) => {
    setBallotStep(step);
  };

  const clearTransaction = () => {
    setTxId(null);
    setBallotStep('initial');
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
        commentsCount: getComments().length,
        setStep,
        ballotStep
      }}
    >
      {children}
    </BallotContext.Provider>
  );
};
