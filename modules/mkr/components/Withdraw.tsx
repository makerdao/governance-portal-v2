/** @jsx jsx */
import { useState } from 'react';
import { Button, Flex, Text, Box, jsx, Alert, Link } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import shallow from 'zustand/shallow';
import useSWR from 'swr';

import Stack from 'modules/app/components/layout/layouts/Stack';
import { MKRInput } from './MKRInput';
import getMaker from 'lib/maker';
import useAccountsStore from 'stores/accounts';
import { CurrencyObject } from 'types/currency';
import { fadeIn, slideUp } from 'lib/keyframes';
import TxIndicators from 'modules/app/components/TxIndicators';
import useTransactionStore, { transactionsSelectors, transactionsApi } from 'stores/transactions';
import invariant from 'tiny-invariant';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { useLockedMkr } from 'lib/hooks';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import BigNumber from 'bignumber.js';

const ModalContent = ({ address, voteProxy, close, ...props }) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);

  invariant(address);
  const [mkrToWithdraw, setMkrToWithdraw] = useState(new BigNumber(0));
  const [txId, setTxId] = useState(null);

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

  const { data: lockedMkr } = useLockedMkr(address, voteProxy);
  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  let content;

  if (tx) {
    const txPending = tx.status === 'pending';
    content = (
      <Stack sx={{ textAlign: 'center' }}>
        <Text as="p" variant="microHeading" color="onBackgroundAlt">
          {txPending ? 'Transaction pending' : 'Confirm transaction'}
        </Text>

        <Flex sx={{ justifyContent: 'center' }}>
          <TxIndicators.Pending sx={{ width: 6 }} />
        </Flex>

        {!txPending && (
          <Box>
            <Text as="p" sx={{ color: 'mutedAlt', fontSize: 3 }}>
              Please use your wallet to confirm this transaction.
            </Text>
            <Text
              as="p"
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
          <Text as="p" variant="microHeading" color="onBackgroundAlt" mb={2}>
            Withdraw from voting contract
          </Text>
          <Text as="p" sx={{ color: 'mutedAlt', fontSize: 3 }}>
            Input the amount of MKR to withdraw from the voting contract.
          </Text>
        </Box>

        <Box>
          <MKRInput
            onChange={setMkrToWithdraw}
            balance={lockedMkr?.toBigNumber()}
            value={mkrToWithdraw}
            balanceText="MKR in contract:"
          />
        </Box>

        {voteProxy && address === voteProxy.getHotAddress() && (
          <Alert variant="notice" sx={{ fontWeight: 'normal' }}>
            You are using the hot wallet for a voting proxy. MKR will be withdrawn to the cold wallet.
          </Alert>
        )}
        <Button
          sx={{ flexDirection: 'column', width: '100%', alignItems: 'center', mt: 3 }}
          disabled={mkrToWithdraw.eq(0) || !lockedMkr || mkrToWithdraw.gt(lockedMkr.toBigNumber())}
          onClick={async () => {
            trackButtonClick('withdrawMkr');
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
          <Text as="p" variant="microHeading" color="onBackgroundAlt" mb={2}>
            Approve voting contract
          </Text>
          <Text as="p" sx={{ color: 'mutedAlt', fontSize: 3 }}>
            Approve the transfer of IOU tokens to the voting contract to withdraw your MKR.
          </Text>
        </Box>

        <Button
          sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
          onClick={async () => {
            trackButtonClick('approveWithdraw');
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
      {props.link ? (
        <Link
          onClick={() => setShowDialog(true)}
          sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'inherit' }}
        >
          {props.link}
        </Link>
      ) : (
        <Button
          variant="mutedOutline"
          onClick={() => setShowDialog(true)}
          {...props}
          data-testid="withdraw-button"
        >
          Withdraw
        </Button>
      )}
    </>
  );
};

export default Withdraw;
