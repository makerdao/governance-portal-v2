/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState, useEffect } from 'react';
import { Box } from 'theme-ui';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';
import { Delegate, DelegateInfo, DelegatePaginated } from '../../types';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { InputDelegateMkr } from './InputDelegateMkr';
import { ApprovalContent } from './Approval';
import { TxDisplay } from './TxDisplay';
import { ConfirmContent } from './Confirm';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { useDelegateLock } from 'modules/delegates/hooks/useDelegateLock';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { useAccount } from 'modules/app/hooks/useAccount';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { Tokens } from 'modules/web3/constants/tokens';
import { formatValue } from 'lib/string';
import DelegateAvatarName from '../DelegateAvatarName';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate | DelegatePaginated | DelegateInfo;
  mutateTotalStaked: (amount?: BigNumber) => void;
  mutateMKRDelegated: () => void;
  title?: string;
  refetchOnDelegation?: boolean;
};

export const DelegateModal = ({
  isOpen,
  onDismiss,
  delegate,
  mutateTotalStaked,
  mutateMKRDelegated,
  title = 'Deposit into delegate contract',
  refetchOnDelegation = true
}: Props): JSX.Element => {
  const { account } = useAccount();

  const voteDelegateAddress = delegate.voteDelegateAddress;
  const [mkrToDeposit, setMkrToDeposit] = useState<BigNumber>(BigNumber.from(0));
  const [confirmStep, setConfirmStep] = useState(false);

  const { data: mkrBalance, mutate: mutateMkrBalance } = useMkrBalance(account);

  const { data: mkrAllowance, mutate: mutateTokenAllowance } = useTokenAllowance(
    Tokens.MKR,
    parseUnits('100000000'),
    account,
    voteDelegateAddress
  );

  const { approve, tx: approveTx, setTxId: resetApprove } = useApproveUnlimitedToken(Tokens.MKR);

  const { lock, tx: lockTx, setTxId: resetLock } = useDelegateLock(voteDelegateAddress);

  const [tx, resetTx] = mkrAllowance ? [lockTx, resetLock] : [approveTx, resetApprove];

  const onClose = () => {
    resetTx(null);
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
              {tx ? (
                <TxDisplay
                  tx={tx}
                  setTxId={resetTx}
                  onDismiss={onClose}
                  title={`Delegating to ${delegate.name}`}
                  description={`Congratulations, you delegated ${formatValue(
                    mkrToDeposit,
                    'wad',
                    6
                  )} MKR to ${delegate.name}.`}
                >
                  <Box sx={{ textAlign: 'left', margin: '0 auto', p: 3 }}>
                    <DelegateAvatarName delegate={delegate} />
                  </Box>
                </TxDisplay>
              ) : (
                <>
                  {mkrAllowance ? (
                    confirmStep ? (
                      <ConfirmContent
                        mkrToDeposit={mkrToDeposit}
                        delegate={delegate}
                        onClick={() => {
                          lock(mkrToDeposit, {
                            mined: () => {
                              refetchOnDelegation ? mutateTotalStaked() : mutateTotalStaked(mkrToDeposit);
                              mutateMKRDelegated();
                              mutateMkrBalance();
                            }
                          });
                        }}
                        onBack={() => setConfirmStep(false)}
                      />
                    ) : (
                      <InputDelegateMkr
                        title={title}
                        description="Input the amount of MKR to deposit into the delegate contract."
                        onChange={setMkrToDeposit}
                        balance={mkrBalance}
                        buttonLabel="Delegate MKR"
                        onClick={() => setConfirmStep(true)}
                        showAlert={true}
                      />
                    )
                  ) : (
                    <ApprovalContent
                      onClick={() =>
                        approve(voteDelegateAddress, {
                          mined: () => {
                            mutateTokenAllowance();
                          }
                        })
                      }
                      title={'Approve Delegate Contract'}
                      buttonLabel={'Approve Delegate Contract'}
                      description={
                        'Approve the transfer of MKR tokens to the delegate contract to deposit your MKR.'
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
