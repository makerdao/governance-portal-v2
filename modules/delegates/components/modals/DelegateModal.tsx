import { useState, useEffect } from 'react';
import { Box } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { fadeIn, slideUp } from 'lib/keyframes';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';
import { Delegate } from '../../types';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { InputDelegateMkr } from './InputDelegateMkr';
import { ApprovalContent } from './Approval';
import { TxDisplay } from './TxDisplay';
import { ConfirmContent } from './Confirm';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { useDelegateLock } from 'modules/delegates/hooks/useDelegateLock';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { useAccount } from 'modules/app/hooks/useAccount';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { Tokens } from 'modules/web3/constants/tokens';
import { formatValue } from 'lib/string';
import DelegateAvatarName from '../DelegateAvatarName';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate;
  mutateTotalStaked: () => void;
  mutateMKRDelegated: () => void;
  title?: string;
};

export const DelegateModal = ({
  isOpen,
  onDismiss,
  delegate,
  mutateTotalStaked,
  mutateMKRDelegated,
  title = 'Deposit into delegate contract'
}: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);
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
    trackButtonClick('closeDelegateModal');
    resetTx(null);
    onDismiss();
  };

  useEffect(() => {
    // Reset the confirmation step
    setConfirmStep(false);
  }, [isOpen]);

  return (
    <>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={isOpen}
        onDismiss={onClose}
      >
        <DialogContent
          aria-label="Delegate modal"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : {
                  variant: 'dialog.desktop',
                  animation: `${fadeIn} 350ms ease`,
                  width: '580px',
                  px: 5,
                  py: 4
                }
          }
        >
          <BoxWithClose close={onClose}>
            <Box>
              {tx ? (
                <TxDisplay
                  tx={tx}
                  setTxId={resetTx}
                  onDismiss={onClose}
                  title={`Delegating to ${delegate.name}`}
                  description={`Congratulations, you delegated ${formatValue(mkrToDeposit)} MKR to ${
                    delegate.name
                  }.`}
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
                              mutateTotalStaked();
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
