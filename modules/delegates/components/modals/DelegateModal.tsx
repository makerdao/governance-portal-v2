/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState, useEffect } from 'react';
import { Box } from 'theme-ui';
import { useSkyBalance } from 'modules/mkr/hooks/useSkyBalance';
import { Delegate, DelegateInfo, DelegatePaginated } from '../../types';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { InputDelegateSky } from './InputDelegateSky';
import { ApprovalContent } from './Approval';
import { TxDisplay } from './TxDisplay';
import { ConfirmContent } from './Confirm';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { useDelegateLock } from 'modules/delegates/hooks/useDelegateLock';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { useAccount } from 'modules/app/hooks/useAccount';
import { Tokens } from 'modules/web3/constants/tokens';
import { formatValue } from 'lib/string';
import DelegateAvatarName from '../DelegateAvatarName';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';
import { TxStatus } from 'modules/web3/constants/transaction';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate | DelegatePaginated | DelegateInfo;
  mutateTotalStaked: (amount?: bigint) => void;
  mutateSkyDelegated: () => void;
  title?: string;
  refetchOnDelegation?: boolean;
};

export const DelegateModal = ({
  isOpen,
  onDismiss,
  delegate,
  mutateTotalStaked,
  mutateSkyDelegated,
  title = 'Deposit into delegate contract',
  refetchOnDelegation = true
}: Props): JSX.Element => {
  const { account } = useAccount();

  const voteDelegateAddress = delegate.voteDelegateAddress;
  const [skyToDeposit, setSkyToDeposit] = useState(0n);
  const [confirmStep, setConfirmStep] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.IDLE);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: skyBalance, mutate: mutateSkyBalance } = useSkyBalance(account);

  const { data: skyAllowance, mutate: mutateTokenAllowance } = useTokenAllowance(
    Tokens.SKY,
    100000000n,
    account,
    voteDelegateAddress
  );

  const approve = useApproveUnlimitedToken({
    name: Tokens.SKY,
    addressToApprove: voteDelegateAddress,
    onStart: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.LOADING);
    },
    onSuccess: () => {
      // Once the approval is successful, return to tx idle so we can lock
      setTxStatus(TxStatus.IDLE);
      setTxHash(undefined);
      mutateTokenAllowance();
      lock.retryPrepare();
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
    }
  });

  const lock = useDelegateLock({
    voteDelegateAddress,
    skyToDeposit,
    onStart: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.LOADING);
    },
    onSuccess: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.SUCCESS);
      refetchOnDelegation ? mutateTotalStaked() : mutateTotalStaked(skyToDeposit);
      mutateSkyDelegated();
      mutateSkyBalance();
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
    },
    enabled: !!skyAllowance && !!skyToDeposit
  });

  const onClose = () => {
    setTxStatus(TxStatus.IDLE);
    setTxHash(undefined);
    onDismiss();
  };

  useEffect(() => {
    // Reset the confirmation step
    setConfirmStep(false);
  }, [isOpen]);

  return (
    <>
      <DialogOverlay isOpen={isOpen} onDismiss={onClose}>
        <DialogContent ariaLabel="Delegate modal" widthDesktop="580px">
          <BoxWithClose close={onClose}>
            <Box>
              {txStatus !== TxStatus.IDLE ? (
                <TxDisplay
                  txStatus={txStatus}
                  setTxStatus={setTxStatus}
                  txHash={txHash}
                  setTxHash={setTxHash}
                  onDismiss={onClose}
                  title={`Delegating to ${delegate.name}`}
                  description={`Congratulations, you delegated ${formatValue(
                    skyToDeposit,
                    'wad',
                    6
                  )} SKY to ${delegate.name}.`}
                >
                  <Box sx={{ textAlign: 'left', margin: '0 auto', p: 3 }}>
                    <DelegateAvatarName delegate={delegate} />
                  </Box>
                </TxDisplay>
              ) : (
                <>
                  {skyAllowance ? (
                    confirmStep ? (
                      <ConfirmContent
                        skyToDeposit={skyToDeposit}
                        delegate={delegate}
                        onClick={() => {
                          setTxStatus(TxStatus.INITIALIZED);
                          lock.execute();
                        }}
                        disabled={
                          skyToDeposit === 0n ||
                          skyToDeposit > (skyBalance || 0n) ||
                          lock.isLoading ||
                          !lock.prepared
                        }
                        onBack={() => setConfirmStep(false)}
                      />
                    ) : (
                      <InputDelegateSky
                        title={title}
                        description="Input the amount of SKY to deposit into the delegate contract."
                        onChange={setSkyToDeposit}
                        balance={skyBalance}
                        buttonLabel="Delegate SKY"
                        onClick={() => setConfirmStep(true)}
                        showAlert={true}
                      />
                    )
                  ) : (
                    <ApprovalContent
                      onClick={() => {
                        setTxStatus(TxStatus.INITIALIZED);
                        approve.execute();
                      }}
                      disabled={approve.isLoading || !approve.prepared}
                      title={'Approve Delegate Contract'}
                      buttonLabel={'Approve Delegate Contract'}
                      description={
                        'Approve the transfer of SKY tokens to the delegate contract to deposit your SKY.'
                      }
                    />
                  )}
                </>
              )}
            </Box>
          </BoxWithClose>
        </DialogContent>
      </DialogOverlay>
    </>
  );
};
