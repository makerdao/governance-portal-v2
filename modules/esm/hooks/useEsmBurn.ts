import { Dispatch, SetStateAction, useState } from 'react';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { Transaction } from 'modules/web3/types/transaction';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useAccount } from 'modules/app/hooks/useAccount';
import { BigNumber } from 'ethers';

type BurnResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<string | null>>;
  burn: (burnAmount: BigNumber, callbacks?: Record<string, (id?: string) => void>) => void;
  tx: Transaction | null;
};

export const useEsmBurn = (): BurnResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account } = useAccount();
  const { esm } = useContracts();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const burn = (burnAmount, callbacks) => {
    const burnTxCreator = () => esm.burn(burnAmount);
    const txId = track(burnTxCreator, account, 'Burning MKR in Emergency Shutdown Module', {
      initialized: () => {
        if (typeof callbacks?.initialized === 'function') callbacks.initialized();
      },
      pending: () => {
        if (typeof callbacks?.pending === 'function') callbacks.pending();
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Burned MKR in Emergency Shutdown Module');
        if (typeof callbacks?.mined === 'function') callbacks.mined();
      },
      error: () => {
        if (typeof callbacks?.error === 'function') callbacks.error();
      }
    });
    setTxId(txId);
  };

  return { txId, setTxId, burn, tx };
};
