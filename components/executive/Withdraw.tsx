/** @jsx jsx */
import { useState, useRef } from 'react';
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
import { changeInputValue } from '../../lib/utils';

const ModalContent = ({ hasLargeIouAllowance, lockedMkr, close, ...props }) => {
  const [mkrToWithdraw, setMkrToWithdraw] = useState(MKR(0));
  const [approveIouTxId, setApproveIouTxId] = useState(null);
  const input = useRef<HTMLInputElement>(null);

  const [track, approveTx] = useTransactionStore(
    state => [
      state.track,
      approveIouTxId ? transactionsSelectors.getTransaction(state, approveIouTxId) : null
    ],
    shallow
  );

  let content;

  if (hasLargeIouAllowance) {
    content = (
      <Stack gap={2}>
        <Box sx={{ textAlign: 'center' }}>
          <Text variant="microHeading" color="onBackgroundAlt" mb={2}>
            Withdraw from voting contract
          </Text>
          <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
            Input the amount of MKR to withdraw from the voting contract.
          </Text>
        </Box>

        <Box>
          <MKRInput
            onChange={setMkrToWithdraw}
            placeholder="0.00 MKR"
            error={mkrToWithdraw.gt(lockedMkr) && 'MKR balance too low'}
            ref={input}
          />
        </Box>
        <Flex sx={{ alignItems: 'baseline', mb: 3 }}>
          <Text sx={{ textTransform: 'uppercase', color: 'mutedAlt', fontSize: 2 }}>
            MKR in contract:&nbsp;
          </Text>
          {lockedMkr ? (
            <Text
              sx={{ fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => {
                if (!input.current) return;
                changeInputValue(input.current, lockedMkr.toBigNumber().toFormat(18));
              }}
            >
              {lockedMkr.toBigNumber().toFormat(6)}
            </Text>
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Flex>
        <Button
          sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
          disabled={mkrToWithdraw.eq(0) || mkrToWithdraw.gt(lockedMkr)}
          onClick={async () => {
            const maker = await getMaker();
            const freeTxCreator = () => maker.service('chief').free(mkrToWithdraw);
            const txId = await track(freeTxCreator, 'Withdrawing MKR', {
              pending: () => close(),
              mined: txId => transactionsApi.getState().setMessage(txId, 'MKR withdrawn'),
              error: () => transactionsApi.getState().setMessage(txId, 'MKR withdraw failed')
            });
          }}
        >
          Withdraw MKR
        </Button>
      </Stack>
    );
  } else if (approveTx) {
    const txPending = approveTx.status === 'pending';
    content = (
      <Stack sx={{ textAlign: 'center' }}>
        <Text variant="microHeading" color="onBackgroundAlt">
          {txPending ? 'Transaction pending' : 'Confirm transaction'}
        </Text>

        <Flex sx={{ justifyContent: 'center' }}>
          <TxIndicators.Pending sx={{ width: 6 }} />
        </Flex>

        {!txPending && (
          <Box>
            <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
              Please use your wallet to confirm this transaction.
            </Text>
            <Text
              sx={{ color: 'muted', cursor: 'pointer', fontSize: 2, mt: 2 }}
              onClick={() => setApproveIouTxId(null)}
            >
              Cancel
            </Text>
          </Box>
        )}
      </Stack>
    );
  } else {
    // user hasn't given approvals or initiated an approval tx
    content = (
      <Stack gap={3} {...props}>
        <Box sx={{ textAlign: 'center' }}>
          <Text variant="microHeading" color="onBackgroundAlt" mb={2}>
            Approve voting contract
          </Text>
          <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
            Approve the vote proxy to withdraw your MKR from the voting contract.
          </Text>
        </Box>

        <Button
          sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
          onClick={async () => {
            const maker = await getMaker();
            const approveTxCreator = () =>
              maker
                .getToken('IOU')
                .approveUnlimited(maker.service('smartContract').getContractAddresses().CHIEF);

            const txId = await track(approveTxCreator, 'Granting IOU approval', {
              mined: txId => transactionsApi.getState().setMessage(txId, 'Granted IOU approval'),
              error: () => {
                transactionsApi.getState().setMessage(txId, 'IOU approval failed');
                setApproveIouTxId(null);
              }
            });
            setApproveIouTxId(txId);
          }}
        >
          Approve vote proxy
        </Button>
      </Stack>
    );
  }

  return <BoxWithClose content={content} close={close} {...props} />;
};

export const BoxWithClose = ({ content, close, ...props }): JSX.Element => (
  <Box sx={{ position: 'relative' }} {...props}>
    <Close
      aria-label="close"
      sx={{
        height: 4,
        width: 4,
        position: 'absolute',
        top: '-17px',
        right: '-42px',
        display: ['none', 'block'],
        outline: 'none'
      }}
      onClick={close}
    />
    {content}
  </Box>
);

const Withdraw = props => {
  const account = useAccountsStore(state => state.currentAccount);
  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();

  const { data: iouAllowance } = useSWR<CurrencyObject>(
    ['/user/iou-allowance', account?.address],
    (_, address) =>
      getMaker().then(maker =>
        maker.getToken('IOU').allowance(address, maker.service('smartContract').getContractAddresses().CHIEF)
      )
  );

  const { data: lockedMkr } = useSWR(
    account?.address ? ['/user/mkr-locked', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('chief').getNumDeposits(address))
  );

  const hasLargeIouAllowance = iouAllowance && iouAllowance.gt('10e26'); // greater than 100,000,000 MKR

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
            sx={{ px: [3, null] }}
            hasLargeIouAllowance={hasLargeIouAllowance}
            lockedMkr={lockedMkr}
            close={() => setShowDialog(false)}
          />
        </DialogContent>
      </DialogOverlay>
      <Button variant="mutedOutline" onClick={() => setShowDialog(true)} {...props}>
        Withdraw
      </Button>
    </>
  );
};

export default Withdraw;
