import { fetchJson } from 'lib/fetchJson';
import { useAccount } from 'modules/app/hooks/useAccount';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/pollComments';
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

interface ContextProps {
  ballot: Ballot;
  transaction?: Transaction;
  previousBallot: Ballot;
  updateVoteFromBallot: (pollId: number, ballotVote: Partial<BallotVote>) => void;
  removeVoteFromBallot: (pollId: number) => void;
  addVoteToBallot: (pollId: number, ballotVote: BallotVote) => void;
  submitBallot: () => void;
  clearBallot: () => void;
  clearTransaction: () => void;
  isPollOnBallot: (pollId: number) => boolean;
  ballotCount: number;
  signComments: () => void;
  commentsSignature: string;
  commentsCount: number;
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
  isPollOnBallot: (pollId: number) => false,
  ballotCount: 0,
  signComments: () => null,
  commentsSignature: '',
  commentsCount: 0
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
  };

  const { network, account: address, library } = useActiveWeb3React();

  // Reset ballot on network or account change
  useEffect(() => {
    clearBallot();
    setPreviousBallot({});
  }, [network, address]);

  // add vote to ballot

  const addVoteToBallot = (pollId: number, ballotVote: BallotVote) => {
    setTxId(null);
    setCommentSignature('');

    setBallot({
      ...ballot,
      [pollId]: ballotVote
    });
  };

  const removeVoteFromBallot = (pollId: number) => {
    setTxId(null);
    setCommentSignature('');

    const { [pollId]: pollToDelete, ...rest } = ballot;
    setBallot(rest);
  };

  const updateVoteFromBallot = (pollId: number, ballotVote: Partial<BallotVote>) => {
    setTxId(null);
    setCommentSignature('');

    setBallot({
      ...ballot,
      [pollId]: {
        ...ballot[pollId],
        ...ballotVote
      }
    });
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

  return (
    <BallotContext.Provider
      value={{
        ballot,
        previousBallot,
        clearBallot,
        clearTransaction: () => setTxId(null),
        addVoteToBallot,
        removeVoteFromBallot,
        updateVoteFromBallot,
        submitBallot,
        transaction,
        isPollOnBallot,
        ballotCount: Object.keys(ballot).length,
        signComments,
        commentsSignature,
        commentsCount: getComments().length
      }}
    >
      {children}
    </BallotContext.Provider>
  );
};
