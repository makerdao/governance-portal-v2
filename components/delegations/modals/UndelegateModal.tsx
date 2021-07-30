/** @jsx jsx */
import { useState } from 'react';
import { Box, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import shallow from 'zustand/shallow';
import mixpanel from 'mixpanel-browser';

import getMaker, { MKR } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { useTokenAllowance } from 'lib/hooks';
import { Delegate } from 'types/delegate';
import useAccountsStore from 'stores/accounts';
import { useMkrDelegated } from 'lib/hooks';
import useTransactionStore, { transactionsSelectors, transactionsApi } from 'stores/transactions';
import { BoxWithClose } from 'components/BoxWithClose';
import { ApprovalContent, InputDelegateMkr, TxDisplay } from 'components/delegations';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate;
};

export const UndelegateModal = ({ isOpen, onDismiss, delegate }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const voteDelegateAddress = delegate.voteDelegateAddress;
  const [mkrToWithdraw, setMkrToWithdraw] = useState(MKR(0));
  const [txId, setTxId] = useState(null);

  const { data: mkrStaked } = useMkrDelegated(address, voteDelegateAddress);
  const { data: iouAllowance } = useTokenAllowance('IOU', address, voteDelegateAddress);

  const hasLargeIouAllowance = iouAllowance?.gt('10e26'); // greater than 100,000,000 IOU

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const approveIou = async () => {
    const maker = await getMaker();
    const approveTxCreator = () => maker.getToken('IOU').approveUnlimited(voteDelegateAddress);
    const txId = await track(approveTxCreator, 'Approving MKR', {
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR approved');
        setTxId(null);
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'MKR approval failed');
        setTxId(null);
      }
    });
    setTxId(txId);
  };

  const freeMkr = async () => {
    const maker = await getMaker();
    const freeTxCreator = () => maker.service('voteDelegate').free(voteDelegateAddress, mkrToWithdraw);
    const txId = await track(freeTxCreator, 'Withdrawing MKR', {
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR withdrawn');
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'MKR withdrawal failed');
      }
    });
    setTxId(txId);
  };

  const onClose = () => {
    mixpanel.track('btn-click', {
      id: 'closeUndelegateModal',
      product: 'governance-portal-v2',
      page: 'Delegates'
    });
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
          <BoxWithClose
            content={
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
                        balance={mkrStaked.toBigNumber()}
                        buttonLabel="Undelegate MKR"
                        onClick={freeMkr}
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
            }
            close={onClose}
          />
        </DialogContent>
      </DialogOverlay>
    </>
  );
};
