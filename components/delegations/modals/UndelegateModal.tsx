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
import { useTokenAllowance } from 'lib/hooks';
import { Delegate } from 'types/delegate';
import useAccountsStore from 'stores/accounts';
import useTransactionStore, { transactionsSelectors, transactionsApi } from 'stores/transactions';
import { BoxWithClose } from 'components/BoxWithClose';
import ApprovalContent from './Approval';
import InputContent from './Input';
import TxDisplay from './TxDisplay';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate;
};

const UndelegateModal = ({ isOpen, onDismiss, delegate }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const voteDelegateAddress = delegate.voteDelegateAddress;
  const [mkrToWithdraw, setMkrToWithdraw] = useState(MKR(0));
  const [txId, setTxId] = useState(null);
  const input = useRef<HTMLInputElement>(null);

  const { data: mkrStaked, error } = useSWR(
    ['/user/mkr-delegated', voteDelegateAddress, address],
    async (_, delegateAddress, address) => {
      const maker = await getMaker();

      const balance = await maker
        .service('voteDelegate')
        .getStakedBalanceForAddress(delegateAddress, address)
        .then(MKR.wei);

      return balance;
    }
  );
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
                      <InputContent
                        title="Withdraw from delegate contract"
                        description="Input the amount of MKR to withdraw from the delegate contract."
                        onChange={setMkrToWithdraw}
                        error={mkrToWithdraw.gt(mkrStaked) && 'MKR balance too low'}
                        ref={input}
                        bpi={bpi}
                        disabled={mkrStaked === undefined}
                        onMkrClick={() => {
                          if (!input.current || mkrStaked === undefined) return;
                          changeInputValue(input.current, mkrStaked.toBigNumber().toString());
                        }}
                        mkrBalance={mkrStaked}
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

export default UndelegateModal;
