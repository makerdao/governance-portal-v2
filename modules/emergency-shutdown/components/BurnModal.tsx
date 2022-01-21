import { useState } from 'react';
import shallow from 'zustand/shallow';
import getMaker, { MKR } from 'lib/maker';
import useTransactionStore, {
  transactionsApi,
  transactionsSelectors
} from 'modules/web3/stores/transactions';
import DefaultScreen from './burnModal/Default';
import MKRAmount from './burnModal/MKRAmount';
import ConfirmBurn from './burnModal/ConfirmBurn';
import BurnSigning from './burnModal/BurnSigning';
import BurnTxSuccess from './burnModal/BurnTxSuccess';
import BurnFailed from './burnModal/BurnFailed';
import { CurrencyObject } from 'modules/app/types/currency';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';
import { TxInProgress } from 'modules/app/components/TxInProgress';
import { useESModuleStats } from '../hooks/useESModuleStats';
import { BigNumber } from 'ethers';
import { useAccount } from 'modules/app/hooks/useAccount';

const ModalContent = ({
  setShowDialog,
  lockedInChief,
  totalStaked
}: {
  setShowDialog: (value: boolean) => void;
  lockedInChief: number;
  totalStaked: BigNumber;
}): React.ReactElement => {
  const { account } = useAccount();
  const [step, setStep] = useState('default');
  const [txId, setTxId] = useState(null);
  const [burnAmount, setBurnAmount] = useState<CurrencyObject>(MKR(0));

  const { mutate: mutateMKRStaked } = useESModuleStats(account);

  const { data: mkrBalance } = useMkrBalance(account);

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
        mutateMKRStaked();
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
      return <TxInProgress tx={tx} txPending={true} setTxId={setTxId} />;
    case 'mined':
      return <BurnTxSuccess tx={tx} close={close} />;
    case 'failed':
      return <BurnFailed close={close} />;
    default:
      return <DefaultScreen setShowDialog={setShowDialog} setStep={setStep} />;
  }
};

export default ModalContent;
