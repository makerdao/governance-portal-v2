import { useState, useRef } from 'react';
import { Button, Flex, Text, Box } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import useSWR from 'swr';
import Skeleton from 'react-loading-skeleton';
import shallow from 'zustand/shallow';

import getMaker, { MKR } from '../../lib/maker';
import { fadeIn, slideUp } from '../../lib/keyframes';
import { changeInputValue } from '../../lib/utils';
import { Delegate } from '../../types/delegate';
import TxIndicators from '../TxIndicators';
import useAccountsStore from '../../stores/accounts';
import useTransactionStore, { transactionsSelectors, transactionsApi } from '../../stores/transactions';
import MKRInput from '../MKRInput';

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

  // TODO: add approval tx and state
  const approveMkr = async () => {
    const maker = await getMaker();
    const tx = maker.getToken(MKR).approveUnlimited(delegate.address);
  };

  const lockMkr = async () => {
    const maker = await getMaker();

    const lockTxCreator = () => maker.service('voteDelegate').lock(delegate.address, mkrToDeposit);
    const txId = await track(lockTxCreator, 'Depositing MKR', {
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR deposited');
        onDismiss();
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'MKR deposit failed');
        onDismiss();
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
                <Flex sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="microHeading" sx={{ fontSize: [3, 6] }}>
                    Deposit into delegate contract
                  </Text>
                  <Text sx={{ color: 'secondaryEmphasis', mt: 2 }}>
                    Input the amount of MKR to deposit into the delegate contract.
                  </Text>
                  <Box sx={{ mt: 3, width: '20rem' }}>
                    <Flex sx={{ border: '1px solid #D8E0E3', justifyContent: 'space-between' }}>
                      <MKRInput
                        onChange={setMkrToDeposit}
                        placeholder="0.00 MKR"
                        error={mkrToDeposit.gt(mkrBalance) && 'MKR balance too low'}
                        style={{ border: '0px solid', width: bpi < 1 ? '100%' : null, m: 0 }}
                        ref={input}
                      />
                      <Button
                        disabled={mkrBalance === undefined}
                        variant="textual"
                        sx={{ width: '100px', fontWeight: 'bold' }}
                        onClick={() => {
                          if (!input.current || mkrBalance === undefined) return;
                          changeInputValue(input.current, mkrBalance.toBigNumber().toString());
                        }}
                      >
                        Set max
                      </Button>
                    </Flex>
                    <Flex sx={{ alignItems: 'baseline', mb: 3, alignSelf: 'flex-start' }}>
                      <Text
                        sx={{
                          textTransform: 'uppercase',
                          color: 'secondaryEmphasis',
                          fontSize: 1,
                          fontWeight: 'bold'
                        }}
                      >
                        MKR Balance:&nbsp;
                      </Text>
                      {mkrBalance ? (
                        <Text
                          sx={{ cursor: 'pointer', fontSize: 2, mt: 2 }}
                          onClick={() => {
                            if (!input.current) return;
                            changeInputValue(input.current, mkrBalance.toBigNumber().toString());
                          }}
                        >
                          {mkrBalance.toBigNumber().toFormat(6)}
                        </Text>
                      ) : (
                        <Box sx={{ width: 6 }}>
                          <Skeleton />
                        </Box>
                      )}
                    </Flex>
                    <Button onClick={lockMkr} disabled={txPending} sx={{ width: '100%' }}>
                      Delegate MKR
                    </Button>
                    {/* <Flex sx={{ justifyContent: 'center' }}>
                  <TxIndicators.Pending sx={{ width: 6 }} />
                </Flex> */}
                  </Box>
                </Flex>
              ) : (
                <Box>TODO: Approval content</Box>
              )}
            </>
          )}
        </DialogContent>
      </DialogOverlay>
    </>
  );
}
