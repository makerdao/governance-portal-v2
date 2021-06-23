/** @jsx jsx */
import { useState, useRef } from 'react';
import { Button, Flex, Text, Box, jsx, Alert } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import Skeleton from 'react-loading-skeleton';
import shallow from 'zustand/shallow';
import useSWR from 'swr';

import Stack from '../layouts/Stack';
import MKRInput from '../MKRInput';
import getMaker, { MKR } from 'lib/maker';
import useAccountsStore from 'stores/accounts';
import { CurrencyObject } from 'types/currency';
import { fadeIn, slideUp } from 'lib/keyframes';
import TxIndicators from '../TxIndicators';
import useTransactionStore, { transactionsSelectors, transactionsApi } from 'stores/transactions';
import { changeInputValue } from 'lib/utils';
import invariant from 'tiny-invariant';
import mixpanel from 'mixpanel-browser';
import { BoxWithClose } from 'components/BoxWithClose';

const ModalContent = ({ address, voteProxy, close, ...props }) => {
  invariant(address);
  const [mkrToWithdraw, setMkrToWithdraw] = useState(MKR(0));
  const [txId, setTxId] = useState(null);
  const input = useRef<HTMLInputElement>(null);

  const { data: allowanceOk } = useSWR<CurrencyObject>(
    ['/user/iou-allowance', address, !!voteProxy],
    (_, address) =>
      voteProxy || // no need for IOU approval when using vote proxy
      getMaker()
        .then(maker =>
          maker
            .getToken('IOU')
            .allowance(address, maker.service('smartContract').getContractAddresses().CHIEF)
        )
        .then(val => val?.gt('10e26')) // greater than 100,000,000 MKR
  );

  const lockedMkrKey = voteProxy?.getProxyAddress() || address;
  const { data: lockedMkr } = useSWR(['/user/mkr-locked', lockedMkrKey], (_, address) =>
    getMaker().then(maker =>
      voteProxy ? voteProxy.getNumDeposits() : maker.service('chief').getNumDeposits(address)
    )
  );

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  let content;

  if (tx) {
    const txPending = tx.status === 'pending';
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
              onClick={() => setTxId(null)}
            >
              Cancel
            </Text>
          </Box>
        )}
      </Stack>
    );
  } else if (allowanceOk) {
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
        <Flex sx={{ alignItems: 'baseline' }}>
          <Text sx={{ textTransform: 'uppercase', color: 'mutedAlt', fontSize: 2 }}>
            MKR in contract:&nbsp;
          </Text>
          {lockedMkr ? (
            <Text
              sx={{ fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => {
                if (!input.current) return;
                changeInputValue(input.current, lockedMkr.toBigNumber().toString());
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
        {voteProxy && address === voteProxy.getHotAddress() && (
          <Alert variant="notice" sx={{ fontWeight: 'normal' }}>
            You are using the hot wallet for a voting proxy. MKR will be withdrawn to the cold wallet.
          </Alert>
        )}
        <Button
          sx={{ flexDirection: 'column', width: '100%', alignItems: 'center', mt: 3 }}
          disabled={mkrToWithdraw.eq(0) || mkrToWithdraw.gt(lockedMkr)}
          onClick={async () => {
            mixpanel.track('btn-click', {
              id: 'withdrawMkr',
              product: 'governance-portal-v2',
              page: 'Executive'
            });
            const maker = await getMaker();

            const freeTxCreator = voteProxy
              ? () => voteProxy.free(mkrToWithdraw)
              : () => maker.service('chief').free(mkrToWithdraw);

            const txId = await track(freeTxCreator, 'Withdrawing MKR', {
              mined: txId => {
                transactionsApi.getState().setMessage(txId, 'MKR withdrawn');
                close();
              },
              error: () => {
                transactionsApi.getState().setMessage(txId, 'MKR withdraw failed');
                close();
              }
            });
            setTxId(txId);
          }}
        >
          Withdraw MKR
        </Button>
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
            Approve the transfer of IOU tokens to the voting contract to withdraw your MKR.
          </Text>
        </Box>

        <Button
          sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
          onClick={async () => {
            mixpanel.track('btn-click', {
              id: 'approveWithdraw',
              product: 'governance-portal-v2',
              page: 'Executive'
            });
            const maker = await getMaker();
            const approveTxCreator = () =>
              maker
                .getToken('IOU')
                .approveUnlimited(maker.service('smartContract').getContractAddresses().CHIEF);

            const txId = await track(approveTxCreator, 'Granting IOU approval', {
              mined: txId => {
                transactionsApi.getState().setMessage(txId, 'Granted IOU approval');
                setTxId(null);
              },
              error: () => {
                transactionsApi.getState().setMessage(txId, 'IOU approval failed');
                setTxId(null);
              }
            });
            setTxId(txId);
          }}
          data-testid="withdraw-approve-button"
        >
          Approve
        </Button>
      </Stack>
    );
  }

  return <BoxWithClose content={content} close={close} {...props} />;
};

const Withdraw = (props): JSX.Element => {
  const account = useAccountsStore(state => state.currentAccount);
  const voteProxy = useAccountsStore(state => (account ? state.proxies[account.address] : null));

  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();

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
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : {
                  variant: 'dialog.desktop',
                  animation: `${fadeIn} 350ms ease`,
                  width: '520px',
                  px: 5,
                  py: 4
                }
          }
        >
          <ModalContent
            sx={{ px: [3, null] }}
            address={account?.address}
            voteProxy={voteProxy}
            close={() => setShowDialog(false)}
          />
        </DialogContent>
      </DialogOverlay>
      <Button
        variant="mutedOutline"
        onClick={() => setShowDialog(true)}
        {...props}
        data-testid="withdraw-button"
      >
        Withdraw
      </Button>
    </>
  );
};

export default Withdraw;
