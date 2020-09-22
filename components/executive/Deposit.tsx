/** @jsx jsx */
import { useState } from 'react';
import { Button, Flex, Text, Close, Box, jsx } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import Skeleton from 'react-loading-skeleton';
import shallow from 'zustand/shallow';
import useSWR from 'swr';

import Stack from '../layouts/Stack';
import MKRInput from '../MKRInput';
import getMaker, { MKR } from '../../lib/maker';
import useAccountsStore from '../../stores/accounts';
import CurrencyObject from '../../types/currency';
import TxIndicators from '../TxIndicators';
import useTransactionStore, { transactionsSelectors, transactionsApi } from '../../stores/transactions';

const ModalContent = ({ hasLargeMkrAllowance, mkrBalance, close, ...props }) => {
  const [mkrToDeposit, setMkrToDeposit] = useState(MKR(0));
  const [approveTxId, setApproveTxId] = useState(null);

  const [track, approveTx] = useTransactionStore(
    state => [state.track, approveTxId ? transactionsSelectors.getTransaction(state, approveTxId) : null],
    shallow
  );

  if (hasLargeMkrAllowance) {
    return (
      <Box {...props}>
        <Stack gap={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Close sx={{ visibility: 'hidden' }} />
              <Text variant="microHeading" color="onBackgroundAlt">
                Deposit into voting contract
              </Text>
              <Close
                aria-label="close"
                sx={{ height: 4, width: 4, p: 0, position: 'relative', top: '-4px', left: '8px' }}
                onClick={close}
              />
            </Flex>
            <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
              Input the amount of MKR to deposit into the voting contract.
            </Text>
          </Box>

          <Box>
            <MKRInput
              onChange={setMkrToDeposit}
              placeholder="0.00 MKR"
              error={mkrToDeposit.gt(mkrBalance) && 'MKR balance too low'}
            />
          </Box>
          <Flex sx={{ alignItems: 'center', mb: 3 }}>
            <Text sx={{ textTransform: 'uppercase', color: 'mutedAlt', fontSize: 2 }}>MKR Balance</Text>
            {mkrBalance ? (
              <Text sx={{ fontWeight: 'bold', ml: 3 }}>{mkrBalance.toBigNumber().toFormat(6)}</Text>
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Flex>
          <Button
            sx={{ flexDirection: 'column', width: '100%' }}
            disabled={mkrToDeposit.eq(0) || mkrToDeposit.gt(mkrBalance)}
          >
            Deposit MKR
          </Button>
        </Stack>
      </Box>
    );
  }

  if (approveTx) {
    const txPending = approveTx.status === 'pending';
    return (
      <Box sx={{ textAlign: 'center' }} {...props}>
        <Stack>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Close sx={{ visibility: 'hidden' }} />
            <Text variant="microHeading" color="onBackgroundAlt">
              {txPending ? 'Transaction pending' : 'Confirm transaction'}
            </Text>
            <Close
              aria-label="close"
              sx={{ height: 4, width: 4, p: 0, position: 'relative', top: '-4px', left: '8px' }}
              onClick={close}
            />
          </Flex>

          <Flex sx={{ justifyContent: 'center' }}>
            <TxIndicators.Pending sx={{ width: 6 }} />
          </Flex>

          {!txPending && (
            <Box>
              <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
                Please use your wallet to confirm this trnasaction.
              </Text>
              <Text
                sx={{ color: 'muted', cursor: 'pointer', fontSize: 2, mt: 2 }}
                onClick={() => setApproveTxId(null)}
              >
                Cancel
              </Text>
            </Box>
          )}
        </Stack>
      </Box>
    );
  }

  // user hasn't given approvals or initiated an approval tx
  return (
    <Box>
      <Stack gap={3} {...props}>
        <Box sx={{ textAlign: 'center' }}>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Close sx={{ visibility: 'hidden' }} />
            <Text variant="microHeading" color="onBackgroundAlt">
              Approve voting contract
            </Text>
            <Close
              aria-label="close"
              sx={{ height: 4, width: 4, p: 0, position: 'relative', top: '-4px', left: '8px' }}
              onClick={close}
            />
          </Flex>
          <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
            Approve the vote proxy to deposit your MKR in the voting contract.
          </Text>
        </Box>

        <Button
          sx={{ flexDirection: 'column', width: '100%' }}
          onClick={async () => {
            const maker = await getMaker();
            const approveTxCreator = () =>
              maker
                .getToken(MKR)
                .approveUnlimited(maker.service('smartContract').getContractAddresses().CHIEF);

            const txId = await track(approveTxCreator, 'Granting MKR approval', {
              mined: txId => transactionsApi.getState().setMessage(txId, 'Granted MKR approval'),
              error: () => {
                transactionsApi.getState().setMessage(txId, 'MKR approval failed');
                setApproveTxId(null);
              }
            });
            setApproveTxId(txId);
          }}
        >
          Approve vote proxy
        </Button>
      </Stack>
    </Box>
  );
};

const Deposit = props => {
  const account = useAccountsStore(state => state.currentAccount);
  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();

  const { data: chiefAllowance } = useSWR<CurrencyObject>(
    ['/user/chief-allowance', account?.address],
    (_, address) =>
      getMaker().then(maker =>
        maker.getToken(MKR).allowance(address, maker.service('smartContract').getContractAddresses().CHIEF)
      )
  );

  const { data: mkrBalance } = useSWR(
    account?.address ? ['/user/mkr-balance', account.address] : null,
    (_, address) => getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  const hasLargeMkrAllowance = chiefAllowance && chiefAllowance.gt('10e26'); // greater than 100,000,000 MKR

  return (
    <>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
      >
        <DialogContent
          aria-label="Executive Vote"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile' }
              : {
                  boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)',
                  width: '520px',
                  borderRadius: '8px',
                  px: 5,
                  py: 4
                }
          }
        >
          <ModalContent
            hasLargeMkrAllowance={hasLargeMkrAllowance}
            mkrBalance={mkrBalance}
            close={() => setShowDialog(false)}
          />
        </DialogContent>
      </DialogOverlay>
      <Button variant="mutedOutline" onClick={() => setShowDialog(true)} {...props}>
        Deposit
      </Button>
    </>
  );
};

export default Deposit;
