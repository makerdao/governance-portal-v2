/** @jsx jsx */
import { useState, useRef } from 'react';
import { Button, Flex, Text, Box, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import useSWR from 'swr';
import shallow from 'zustand/shallow';

import getMaker, { MKR } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { changeInputValue } from 'lib/utils';
import { Delegate } from 'types/delegate';
import TxIndicators from 'components/TxIndicators';
import useAccountsStore from 'stores/accounts';
import useTransactionStore, { transactionsSelectors, transactionsApi } from 'stores/transactions';
import { BoxWithClose } from 'components/BoxWithClose';
import ApprovalContent from './Approval';
import InputContent from './Input';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate;
};

export default function DelegateModal({ isOpen, onDismiss, delegate }: Props): JSX.Element {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const [mkrToDeposit, setMkrToDeposit] = useState(MKR(0));
  const [txId, setTxId] = useState(null);
  const input = useRef<HTMLInputElement>(null);

  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  const { data: mkrAllowance } = useSWR(['/user/mkr-allowance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).allowance(address, delegate.address))
  );

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

  const txPending = tx?.status === 'pending';

  return (
    <>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={isOpen}
        onDismiss={onDismiss}
      >
        <DialogContent
          aria-label="Delegate modal"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : {
                  variant: 'dialog.desktop',
                  animation: `${fadeIn} 350ms ease`,
                  width: '380px',
                  px: 5,
                  py: 4
                }
          }
        >
          <BoxWithClose
            content={
              <Box>
                {tx ? (
                  <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
                    <Text variant="microHeading" color="onBackgroundAlt">
                      {txPending ? 'Transaction pending' : 'Confirm transaction'}
                    </Text>

                    <Flex sx={{ justifyContent: 'center', mt: 4 }}>
                      <TxIndicators.Pending sx={{ width: 6 }} />
                    </Flex>

                    {!txPending && (
                      <Box sx={{ mt: 4 }}>
                        <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
                          Please use your wallet to confirm this transaction.
                        </Text>
                        <Text
                          sx={{ color: 'muted', cursor: 'pointer', fontSize: 2, mt: 2 }}
                          onClick={() => setTxId(null)}
                        >
                          Cancel
                        </Text>
                      </Box>
                    )}
                  </Flex>
                ) : (
                  <>
                    {mkrBalance && hasLargeMkrAllowance ? (
                      <InputContent
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
                        onClick={lockMkr}
                      />
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
            close={onDismiss}
          />
        </DialogContent>
      </DialogOverlay>
    </>
  );
}
