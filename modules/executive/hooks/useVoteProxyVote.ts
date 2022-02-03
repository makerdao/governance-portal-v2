import { Dispatch, SetStateAction, useState } from 'react';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { Transaction } from 'modules/web3/types/transaction';
import { useAccount } from 'modules/app/hooks/useAccount';

type VoteResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<string | null>>;
  vote: (slateOrProposals: any | any[], callbacks?: Record<string, (id: string) => void>) => void;
  tx: Transaction | null;
};

export const useVoteProxyVote = (): VoteResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account, voteProxyContract } = useAccount();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const vote = (slateOrProposals: any | any[], callbacks?: Record<string, (id: string) => void>) => {
    const voteCall = voteProxyContract
      ? Array.isArray(slateOrProposals)
        ? voteProxyContract['vote(address[])']
        : voteProxyContract['vote(bytes32)']
      : null;

    const voteTxCreator = () => voteCall(slateOrProposals);

    const transactionId = track(voteTxCreator, account, 'Voting on executive proposal', {
      initialized: txId => {
        if (typeof callbacks?.initialized === 'function') callbacks.initialized(txId);
      },
      pending: hash => {
        if (typeof callbacks?.pending === 'function') callbacks.pending(hash);
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Voted on executive proposal');
        if (typeof callbacks?.mined === 'function') callbacks.mined(txId);
      },
      error: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR deposit failed');
        if (typeof callbacks?.error === 'function') callbacks.error(txId);
      }
    });
    setTxId(transactionId);
  };

  return { txId, setTxId, vote, tx };
};
