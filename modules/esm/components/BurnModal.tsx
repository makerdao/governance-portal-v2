import { useState } from 'react';
import DefaultScreen from './burnModal/Default';
import MKRAmount from './burnModal/MKRAmount';
import ConfirmBurn from './burnModal/ConfirmBurn';
import BurnTxSuccess from './burnModal/BurnTxSuccess';
import BurnFailed from './burnModal/BurnFailed';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';
import { BigNumber } from 'ethers';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useEsmBurn } from '../hooks/useEsmBurn';
import { TxInProgress } from 'modules/app/components/TxInProgress';

const ModalContent = ({
  setShowDialog,
  lockedInChief,
  totalStaked,
  mutateTotalStaked,
  mutateMkrInEsmByAddress
}: {
  setShowDialog: (value: boolean) => void;
  lockedInChief: BigNumber;
  totalStaked: BigNumber;
  mutateTotalStaked: () => void;
  mutateMkrInEsmByAddress: () => void;
}): React.ReactElement => {
  const { account } = useAccount();
  const [step, setStep] = useState('default');
  const [burnAmount, setBurnAmount] = useState(BigNumber.from(0));

  const { data: mkrBalance } = useMkrBalance(account);

  const { burn, tx, setTxId } = useEsmBurn();

  const close = () => setShowDialog(false);

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
          burn={() => {
            burn(burnAmount, {
              initialized: () => setStep('signing'),
              pending: () => setStep('pending'),
              mined: () => {
                mutateTotalStaked();
                mutateMkrInEsmByAddress();
                setStep('mined');
              },
              error: () => setStep('failed')
            });
          }}
          totalStaked={totalStaked}
        />
      );
    case 'signing':
      return <TxInProgress tx={tx} txPending={tx?.status === 'pending'} setTxId={setTxId} />;
    case 'pending':
      return <TxInProgress tx={tx} txPending={tx?.status === 'pending'} setTxId={setTxId} />;
    case 'mined':
      return <BurnTxSuccess tx={tx} close={close} />;
    case 'failed':
      return <BurnFailed close={close} />;
    default:
      return <DefaultScreen setShowDialog={setShowDialog} setStep={setStep} />;
  }
};

export default ModalContent;
