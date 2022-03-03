import { Dispatch, SetStateAction, useState } from 'react';
import isNil from 'lodash/isNil';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { Transaction } from 'modules/web3/types/transaction';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useAccount } from 'modules/app/hooks/useAccount';
import useBallotStore, { ballotApi } from '../stores/ballotStore';
import { PollsCommentsRequestBody } from 'modules/comments/types/pollComments';
import { fetchJson } from 'lib/fetchJson';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { toast } from 'react-toastify';

type SubmitBallotResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<string | null>>;
  submitBallot: (callbacks?: Record<string, (id?: string) => void>) => void;
  tx: Transaction | null;
};

export const useSubmitBallot = (): SubmitBallotResponse => {
  const { network } = useActiveWeb3React();
  const [txId, setTxId] = useState<string | null>(null);

  const { account, voteDelegateContract, voteDelegateContractAddress, voteProxyContractAddress } =
    useAccount();
  const { polling } = useContracts();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const { ballot, clearBallot, signedMessage, comments, setComments, updatePreviousVotes } = useBallotStore(
    state => ({
      ballot: state.ballot,
      clearBallot: state.clearBallot,
      signedMessage: state.signedMessage,
      comments: state.comments,
      setComments: state.setComments,
      updatePreviousVotes: state.updatePreviousVotes
    })
  );

  const newBallot = {};

  const pollIds: string[] = [];
  const pollOptions: string[] = [];

  Object.keys(ballot).forEach((key: string) => {
    if (!isNil(ballot[key].option)) {
      newBallot[key] = { ...ballot[key], submittedOption: ballot[key].option };
      pollIds.push(key);
      pollOptions.push(ballot[key].option);
    }
  });

  const submitBallot = callbacks => {
    const voteTxCreator = voteDelegateContract
      ? () => voteDelegateContract['votePoll(uint256[],uint256[])'](pollIds, pollOptions)
      : () => polling['vote(uint256[],uint256[])'](pollIds, pollOptions);

    const txId = track(voteTxCreator, account, `Voting on ${Object.keys(ballot).length} polls`, {
      initialized: () => {
        if (typeof callbacks?.initialized === 'function') callbacks.initialized();
      },
      pending: txHash => {
        if (typeof callbacks?.pending === 'function') callbacks.pending();

        // if comment included, add to comments db
        if (comments.length > 0) {
          const commentsRequest: PollsCommentsRequestBody = {
            voterAddress: account || '',
            delegateAddress: voteDelegateContract ? voteDelegateContractAddress : '',
            voteProxyAddress: voteProxyContractAddress ? voteProxyContractAddress : '',
            comments,
            signedMessage,
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
      mined: txId => {
        if (typeof callbacks?.mined === 'function') callbacks.mined();
        // Set votes
        updatePreviousVotes();
        setComments([]);
        clearBallot();
        transactionsApi.getState().setMessage(txId, `Voted on ${Object.keys(ballot).length} polls`);
      },
      error: () => {
        if (typeof callbacks?.error === 'function') callbacks.error();
      }
    });
    setTxId(txId);
    ballotApi.setState({ ballot: newBallot, txId });
  };

  return { txId, setTxId, submitBallot, tx };
};
