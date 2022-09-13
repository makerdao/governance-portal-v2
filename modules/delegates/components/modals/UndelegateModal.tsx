import { useState } from 'react';
import { Box } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';

import { fadeIn, slideUp } from 'lib/keyframes';
import { Delegate } from '../../types';
import { useMkrDelegated } from 'modules/mkr/hooks/useMkrDelegated';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { ApprovalContent, InputDelegateMkr, TxDisplay } from 'modules/delegates/components';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { useDelegateFree } from 'modules/delegates/hooks/useDelegateFree';
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
};

export const UndelegateModal = ({
  isOpen,
  onDismiss,
  delegate,
  mutateTotalStaked,
  mutateMKRDelegated
}: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);
  const { account } = useAccount();
  const voteDelegateAddress = delegate.voteDelegateAddress;
  const [mkrToWithdraw, setMkrToWithdraw] = useState(BigNumber.from(0));

  const { data: mkrStaked } = useMkrDelegated(account, voteDelegateAddress);
  const { data: iouAllowance, mutate: mutateTokenAllowance } = useTokenAllowance(
    Tokens.IOU,
    parseUnits('100000000'),
    account,
    voteDelegateAddress
  );

  const { approve, tx: approveTx, setTxId: resetApprove } = useApproveUnlimitedToken(Tokens.IOU);

  const { free, tx: freeTx, setTxId: resetFree } = useDelegateFree(voteDelegateAddress);

  const [tx, resetTx] = iouAllowance ? [freeTx, resetFree] : [approveTx, resetApprove];

  const onClose = () => {
    trackButtonClick('closeUndelegateModal');
    resetTx(null);
    onDismiss();
  };

  return (
    <>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={isOpen}
        onDismiss={onClose}
      >
        <DialogContent
          aria-label="Undelegate modal"
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
                  title={'Undelegating MKR'}
                  description={`You undelegated ${formatValue(mkrToWithdraw, 'wad', 6)} from ${
                    delegate.name
                  }`}
                >
                  <Box sx={{ textAlign: 'left', margin: '0 auto', p: 3 }}>
                    <DelegateAvatarName delegate={delegate} />
                  </Box>
                </TxDisplay>
              ) : (
                <>
                  {mkrStaked && iouAllowance ? (
                    <InputDelegateMkr
                      title="Withdraw from delegate contract"
                      description="Input the amount of MKR to withdraw from the delegate contract."
                      onChange={setMkrToWithdraw}
                      balance={mkrStaked}
                      buttonLabel="Undelegate MKR"
                      onClick={() => {
                        free(mkrToWithdraw, {
                          mined: () => {
                            mutateTotalStaked();
                            mutateMKRDelegated();
                          }
                        });
                      }}
                      showAlert={false}
                    />
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
                        'Approve the transfer of IOU tokens to the delegate contract to withdraw your MKR.'
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
