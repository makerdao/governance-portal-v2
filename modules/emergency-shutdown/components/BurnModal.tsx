import { useState } from 'react';
import shallow from 'zustand/shallow';
import getMaker, { MKR } from 'lib/maker';
import useTransactionStore, { transactionsApi, transactionsSelectors } from 'stores/transactions';
import useAccountsStore from 'stores/accounts';
import DefaultScreen from './burnModal/Default';
import MKRAmount from './burnModal/MKRAmount';
import ConfirmBurn from './burnModal/ConfirmBurn';
import BurnSigning from './burnModal/BurnSigning';
import BurnTxSuccess from './burnModal/BurnTxSuccess';
import BurnFailed from './burnModal/BurnFailed';
import { CurrencyObject } from 'types/currency';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';
import { TransactionInProgress } from 'modules/app/components/TransactionInProgress';

const ModalContent = ({
  setShowDialog,
  lockedInChief,
  totalStaked
}: {
  setShowDialog: (value: boolean) => void;
  lockedInChief: number;
  totalStaked: CurrencyObject;
}): React.ReactElement => {
  const account = useAccountsStore(state => state.currentAccount);
  const [step, setStep] = useState('default');
  const [txId, setTxId] = useState(null);
  const [burnAmount, setBurnAmount] = useState<CurrencyObject>(MKR(0));

  const { data: mkrBalance } = useMkrBalance(account?.address);

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const close = () => setShowDialog(false);

  const burn = async () => {
    const maker = await getMaker();
    const esm = await maker.service('esm');
    const burnTxObject = () => esm.stake(burnAmount);
    const txId = await track(burnTxObject, 'Burning MKR in Emergency Shutdown Module', {
      pending: () => {
        setStep('pending');
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Burned MKR in Emergency Shutdown Module');
        setStep('mined');
      },
      error: () => setStep('failed')
    });

    setTxId(txId);
    setStep('signing');
  };

  switch (step) {
    case 'default':
      return <DefaultScreen setShowDialog={setShowDialog} setStep={setStep} />;
    case 'amount':
      return (
        <MKRAmount
          lockedInChief={lockedInChief}
          setBurnAmount={setBurnAmount}
          setShowDialog={setShowDialog}
          burnAmount={burnAmount}
          setStep={setStep}
          mkrBalance={mkrBalance}
        />
      );
    case 'confirm':
      return (
        <ConfirmBurn
          burnAmount={burnAmount}
          account={account}
          setShowDialog={setShowDialog}
          burn={burn}
          totalStaked={totalStaked}
        />
      );
    case 'signing':
      return <BurnSigning close={close} />;
    case 'pending':
      return <TransactionInProgress tx={tx} txPending={true} setTxId={setTxId} />;
    case 'mined':
      return <BurnTxSuccess tx={tx} close={close} />;
    case 'failed':
      return <BurnFailed close={close} />;
    default:
      return <DefaultScreen setShowDialog={setShowDialog} setStep={setStep} />;
  }
};

export default ModalContent;
