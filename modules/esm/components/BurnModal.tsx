/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import DefaultScreen from './burnModal/Default';
import MKRAmount from './burnModal/MKRAmount';
import ConfirmBurn from './burnModal/ConfirmBurn';
import BurnTxSuccess from './burnModal/BurnTxSuccess';
import BurnFailed from './burnModal/BurnFailed';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useEsmBurn } from '../hooks/useEsmBurn';
import { TxInProgress } from 'modules/app/components/TxInProgress';
import { TxStatus } from 'modules/web3/constants/transaction';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { Tokens } from 'modules/web3/constants/tokens';
import { esmAddress } from 'modules/contracts/generated';
import { useChainId } from 'wagmi';

const ModalContent = ({
  setShowDialog,
  lockedInChief,
  totalStaked,
  mutateTotalStaked,
  mutateMkrInEsmByAddress
}: {
  setShowDialog: (value: boolean) => void;
  lockedInChief: bigint;
  totalStaked: bigint;
  mutateTotalStaked: () => void;
  mutateMkrInEsmByAddress: () => void;
}): React.ReactElement => {
  const { account } = useAccount();
  const chainId = useChainId();
  const [step, setStep] = useState('default');
  const [burnAmount, setBurnAmount] = useState(0n);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.IDLE);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: mkrBalance } = useMkrBalance(account);

  const { data: allowance } = useTokenAllowance(Tokens.MKR, burnAmount, account, esmAddress[chainId]);

  const burn = useEsmBurn({
    burnAmount,
    onStart: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.LOADING);
      setStep('pending');
    },
    onSuccess: (hash: `0x${string}`) => {
      setTxHash(hash);
      mutateTotalStaked();
      mutateMkrInEsmByAddress();
      setTxStatus(TxStatus.SUCCESS);
      setStep('mined');
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
      setStep('failed');
    },
    enabled: !!allowance
  });

  console.log({ burnAmount, error: burn.error, prepareError: burn.prepareError });

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
          burnDisabled={burn.isLoading || !burn.prepared}
          burn={() => {
            setTxStatus(TxStatus.INITIALIZED);
            setStep('signing');
            burn.execute();
          }}
          totalStaked={totalStaked}
        />
      );
    case 'signing':
      return (
        <TxInProgress txStatus={txStatus} setTxStatus={setTxStatus} txHash={txHash} setTxHash={setTxHash} />
      );
    case 'pending':
      return (
        <TxInProgress txStatus={txStatus} setTxStatus={setTxStatus} txHash={txHash} setTxHash={setTxHash} />
      );
    case 'mined':
      return <BurnTxSuccess txHash={txHash} close={close} />;
    case 'failed':
      return <BurnFailed close={close} />;
    default:
      return <DefaultScreen setShowDialog={setShowDialog} setStep={setStep} />;
  }
};

export default ModalContent;
