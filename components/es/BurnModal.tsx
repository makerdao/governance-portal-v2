/** @jsx jsx */
import { useState } from 'react';
import { jsx } from 'theme-ui';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import getMaker, { MKR } from '../../lib/maker';
import CurrencyObject from '../../types/currency';
import useTransactionStore, { transactionsApi, transactionsSelectors } from '../../stores/transactions';
import useAccountsStore from '../../stores/accounts';
import DefaultScreen from './burnModal/Default';
import MKRAmount from './burnModal/MKRAmount';
import ConfirmBurn from './burnModal/ConfirmBurn';
import BurnSigning from './burnModal/BurnSigning';
import BurnPending from './burnModal/BurnPending';
import BurnFailed from './burnModal/BurnFailed';

const ModalContent = ({
  setShowDialog,
  lockedInChief,
  totalStaked
}: {
  setShowDialog: (value: boolean) => void;
  lockedInChief: number;
  totalStaked: CurrencyObject;
}) => {
  const account = useAccountsStore(state => state.currentAccount);
  const [step, setStep] = useState('default');
  const [txId, setTxId] = useState(null);
  const [burnAmount, setBurnAmount] = useState(MKR(0));
  const { data: mkrBalance } = useSWR(['/user/mkr-balance', account?.address], (_, account) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(account))
  );

  // function updateValue(e: { currentTarget: { value: string } }) {
  //   const newValueStr = e.currentTarget.value;
  //   console.log(newValueStr, 'hi')
  //   /* eslint-disable no-useless-escape */
  //   if (!/^((0|[1-9]\d*)(\.\d+)?)?$/.test(newValueStr)) return; // only non-negative valid numbers
  //   const newValue = MKR(newValueStr || '0');
  //   // const invalidValue = (min && newValue.lt(min)) || (max && newValue.gt(max));
  //   // if (invalidValue) {
  //   //   return;
  //   // }
  //   // console.log()
  //   setBurnAmountStr(newValueStr);
  //   setBurnAmount(newValue);
  // }

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const close = () => setShowDialog(false);

  const burn = async () => {
    const maker = await getMaker();
    const esm = await maker.service('esm');
    const burnTxObject = esm.stake(burnAmount);
    const txId = await track(burnTxObject, 'Burning MKR in Emergency Shutdown Module', {
      pending: txHash => {
        setStep('pending');
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Burned MKR in Emergency Shutdown Module');
        close(); // TBD maybe show a separate "done" dialog
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
      return <BurnSigning />;
    case 'pending':
      return <BurnPending tx={tx} />;
    case 'failed':
      return <BurnFailed />;
    default:
      return <DefaultScreen setShowDialog={setShowDialog} setStep={setStep} />;
  }
};

export default ModalContent;
