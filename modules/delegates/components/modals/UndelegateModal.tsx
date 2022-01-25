import { useState } from 'react';
import { Box } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import shallow from 'zustand/shallow';

import { MKR } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { Delegate } from '../../types';
import { useMkrDelegated } from 'modules/mkr/hooks/useMkrDelegated';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { ApprovalContent, InputDelegateMkr, TxDisplay } from 'modules/delegates/components';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { useDelegateFree } from 'modules/delegates/hooks/useDelegateFree';
import { parseUnits } from '@ethersproject/units';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { useAccount } from 'modules/app/hooks/useAccount';

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
  const [mkrToWithdraw, setMkrToWithdraw] = useState(MKR(0));
  const [txId, setTxId] = useState(null);

  const { data: mkrStaked } = useMkrDelegated(account, voteDelegateAddress);
  const { data: iouAllowance } = useTokenAllowance('iou', account, voteDelegateAddress);

  const { data: free } = useDelegateFree(voteDelegateAddress);
  const approveIOU = useApproveUnlimitedToken('iou');

  const hasLargeIouAllowance = iouAllowance?.gt('10e26'); // greater than 100,000,000 IOU

  const [trackTransaction, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const approveIou = async () => {
    const approveTxCreator = () => approveIOU(voteDelegateAddress);
    const txId = await trackTransaction(approveTxCreator, account, 'Approving IOU', {
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'IOU approved');
        setTxId(null);
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'IOU approval failed');
        setTxId(null);
      }
    });
    setTxId(txId);
  };

  const freeMkr = async () => {
    //TODO: update the mkr input to handle ethers bignumber
    const amt = mkrToWithdraw.toString();
    const freeTxCreator = () => free(parseUnits(amt, 18));

    const txId = await trackTransaction(freeTxCreator, account, 'Withdrawing MKR', {
      mined: txId => {
        mutateTotalStaked();
        mutateMKRDelegated();
        transactionsApi.getState().setMessage(txId, 'MKR withdrawn');
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'MKR withdrawal failed');
      }
    });
    setTxId(txId);
  };

  const onClose = () => {
    trackButtonClick('closeUndelegateModal');
    setTxId(null);
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
                <TxDisplay tx={tx} setTxId={setTxId} onDismiss={onClose} />
              ) : (
                <>
                  {mkrStaked && hasLargeIouAllowance ? (
                    <InputDelegateMkr
                      title="Withdraw from delegate contract"
                      description="Input the amount of MKR to withdraw from the delegate contract."
                      onChange={setMkrToWithdraw}
                      balance={mkrStaked}
                      buttonLabel="Undelegate MKR"
                      onClick={freeMkr}
                      showAlert={false}
                    />
                  ) : (
                    <ApprovalContent
                      onClick={approveIou}
                      title={'Approve Delegate Contract'}
                      buttonLabel={'Approve Delegate Contract'}
                      description={
                        'Approve the transfer of IOU tokens to the delegate contract to wtihdraw your MKR.'
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
