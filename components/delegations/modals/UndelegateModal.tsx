/** @jsx jsx */
import { useState, useRef } from 'react';
import { Box, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import getMaker, { MKR } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { changeInputValue } from 'lib/utils';
import { Delegate } from 'types/delegate';
import useAccountsStore from 'stores/accounts';
import useTransactionStore, { transactionsSelectors, transactionsApi } from 'stores/transactions';
import { BoxWithClose } from 'components/BoxWithClose';
import ApprovalContent from './Approval';
import InputContent from './Input';
import TransactionInProgress from './TransactionInProgress';

type Props = {
  isOpen: boolean;
  onDismiss: (boolean) => void;
  delegate: Delegate;
};

export default function DelegateModal({ isOpen, onDismiss, delegate }: Props): JSX.Element {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const [mkrToDeposit, setMkrToDeposit] = useState(MKR(0));
  const [txId, setTxId] = useState(null);
  const input = useRef<HTMLInputElement>(null);

  // TODO: update to delegate contract balance for this user
  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  const { data: iouAllowance } = useSWR(['/user/iou-allowance', address], (_, address) =>
    getMaker().then(maker => maker.getToken('IOU').allowance(address, delegate.address))
  );

  const hasLargeIouAllowance = iouAllowance?.gt('10e26'); // greater than 100,000,000 IOU

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const approveIou = async () => {
    const maker = await getMaker();
    const approveTxCreator = () => maker.getToken('IOU').approveUnlimited(delegate.address);
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
    const freeTxCreator = () => maker.service('voteDelegate').free(delegate.address, mkrToDeposit);
    const txId = await track(freeTxCreator, 'Withdrawing MKR', {
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR withdrawn');
        // TODO: set to success state
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'MKR withdrawal failed');
        // TODO: set to error state
      }
    });
    setTxId(txId);
  };

  const txPending = tx?.status === 'pending';

  return (
    <>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={isOpen}
        onDismiss={onDismiss}
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
                  <TransactionInProgress txPending={txPending} setTxId={setTxId} />
                ) : (
                  <>
                    {mkrBalance && hasLargeIouAllowance ? (
                      <InputContent
                        title="Withdraw from delegate contract"
                        description="Input the amount of MKR to withdraw from the delegate contract."
                        onChange={setMkrToDeposit}
                        error={mkrToDeposit.gt(mkrBalance) && 'MKR balance too low'}
                        ref={input}
                        bpi={bpi}
                        disabled={mkrBalance === undefined}
                        onMkrClick={() => {
                          if (!input.current || mkrBalance === undefined) return;
                          changeInputValue(input.current, mkrBalance.toBigNumber().toString());
                        }}
                        mkrBalance={mkrBalance}
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
            close={onDismiss}
          />
        </DialogContent>
      </DialogOverlay>
    </>
  );
}
