/** @jsx jsx */
import { useState, useRef } from 'react';
import { Box, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import shallow from 'zustand/shallow';
import getMaker, { MKR } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { changeInputValue } from 'lib/utils';
import { useMkrBalance, useTokenAllowance } from 'lib/hooks';
import { Delegate } from 'types/delegate';
import useAccountsStore from 'stores/accounts';
import useTransactionStore, { transactionsSelectors, transactionsApi } from 'stores/transactions';
import { BoxWithClose } from 'components/BoxWithClose';
import ApprovalContent from './Approval';
import ConfirmContent from './Confirm';
import InputContent from './Input';
import TxDisplay from './TxDisplay';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate;
};

const DelegateModal = ({ isOpen, onDismiss, delegate }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const [mkrToDeposit, setMkrToDeposit] = useState(MKR(0));
  const [txId, setTxId] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const { data: mkrBalance } = useMkrBalance(address);

  const { data: mkrAllowance } = useTokenAllowance(MKR, address, delegate.address);

  const hasLargeMkrAllowance = mkrAllowance?.gt('10e26'); // greater than 100,000,000 MKR

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const approveMkr = async () => {
    const maker = await getMaker();
    const approveTxCreator = () => maker.getToken(MKR).approveUnlimited(delegate.address);
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

  const lockMkr = async () => {
    const maker = await getMaker();

    const lockTxCreator = () => maker.service('voteDelegate').lock(delegate.address, mkrToDeposit);
    const txId = await track(lockTxCreator, 'Depositing MKR', {
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR deposited');
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'MKR deposit failed');
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
          <BoxWithClose
            content={
              <Box>
                {tx ? (
                  <TxDisplay tx={tx} setTxId={setTxId} onDismiss={onClose} />
                ) : (
                  <>
                    {mkrAllowance && hasLargeMkrAllowance ? (
                      confirmStep ? (
                        <ConfirmContent
                          mkrToDeposit={mkrToDeposit}
                          delegate={delegate}
                          onClick={lockMkr}
                          onBack={() => setConfirmStep(false)}
                        />
                      ) : (
                        <InputContent
                          title="Deposit into delegate contract"
                          description="Input the amount of MKR to deposit into the delegate contract."
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
                          buttonLabel="Delegate MKR"
                          onClick={() => setConfirmStep(true)}
                        />
                      )
                    ) : (
                      <ApprovalContent
                        onClick={approveMkr}
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
            }
            close={onClose}
          />
        </DialogContent>
      </DialogOverlay>
    </>
  );
};

export default DelegateModal;
