/** @jsx jsx */
import { useState, useRef } from 'react';
import { Button, Flex, Text, Box, jsx } from 'theme-ui';
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
import { fadeIn } from '../../lib/keyframes';
import useTransactionStore, { transactionsSelectors, transactionsApi } from '../../stores/transactions';
import { changeInputValue } from '../../lib/utils';
import { BoxWithClose } from './Withdraw';
import invariant from 'tiny-invariant';

const ModalContent = ({ address, voteProxy, close, ...props }) => {
  invariant(address);
  const [mkrToDeposit, setMkrToDeposit] = useState(MKR(0));
  const [txId, setTxId] = useState(null);
  const input = useRef<HTMLInputElement>(null);

  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  const { data: chiefAllowance } = useSWR<CurrencyObject>(
    ['/user/chief-allowance', address, !!voteProxy],
    (_, address) =>
      getMaker().then(maker =>
        maker
          .getToken(MKR)
          .allowance(
            address,
            address === voteProxy?.getColdAddress()
              ? voteProxy?.getProxyAddress()
              : maker.service('smartContract').getContractAddresses().CHIEF
          )
      )
  );

  const hasLargeMkrAllowance = chiefAllowance?.gt('10e26'); // greater than 100,000,000 MKR

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
  } else if (hasLargeMkrAllowance) {
    content = (
      <Stack gap={2}>
        <Box sx={{ textAlign: 'center' }}>
          <Text variant="microHeading" color="onBackgroundAlt">
            Deposit into voting contract
          </Text>
          <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
            Input the amount of MKR to deposit into the voting contract.
          </Text>
        </Box>

        <Box>
          <MKRInput
            onChange={setMkrToDeposit}
            placeholder="0.00 MKR"
            error={mkrToDeposit.gt(mkrBalance) && 'MKR balance too low'}
            ref={input}
          />
        </Box>
        <Flex sx={{ alignItems: 'baseline', mb: 3 }}>
          <Text sx={{ textTransform: 'uppercase', color: 'mutedAlt', fontSize: 2 }}>MKR Balance:&nbsp;</Text>
          {mkrBalance ? (
            <Text
              sx={{ fontWeight: 'bold', cursor: 'pointer' }}
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
        <Button
          sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
          disabled={mkrToDeposit.eq(0) || mkrToDeposit.gt(mkrBalance)}
          onClick={async () => {
            const maker = await getMaker();
            const lockTxCreator = voteProxy
              ? () => voteProxy.lock(mkrToDeposit)
              : () => maker.service('chief').lock(mkrToDeposit);
            const txId = await track(lockTxCreator, 'Depositing MKR', {
              mined: txId => {
                transactionsApi.getState().setMessage(txId, 'MKR deposited');
                close();
              },
              error: () => {
                transactionsApi.getState().setMessage(txId, 'MKR deposit failed');
                close();
              }
            });
            setTxId(txId);
          }}
        >
          Deposit MKR
        </Button>
      </Stack>
    );
  } else {
    content = (
      <Stack gap={3} {...props}>
        <Box sx={{ textAlign: 'center' }}>
          <Text variant="microHeading" color="onBackgroundAlt">
            Approve voting contract
          </Text>
          <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
            Approve the transfer of MKR to the voting contract.
          </Text>
        </Box>

        <Button
          sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
          onClick={async () => {
            const maker = await getMaker();
            const approveTxCreator = () =>
              maker
                .getToken(MKR)
                .approveUnlimited(
                  voteProxy?.getProxyAddress() || maker.service('smartContract').getContractAddresses().CHIEF
                );

            const txId = await track(approveTxCreator, 'Granting MKR approval', {
              mined: txId => {
                transactionsApi.getState().setMessage(txId, 'Granted MKR approval');
                setTxId(null);
              },
              error: () => {
                transactionsApi.getState().setMessage(txId, 'MKR approval failed');
                setTxId(null);
              }
            });
            setTxId(txId);
          }}
        >
          Approve
        </Button>
      </Stack>
    );
  }
  return <BoxWithClose content={content} close={close} {...props} />;
};

const Deposit = (props): JSX.Element => {
  const account = useAccountsStore(state => state.currentAccount);
  const voteProxy = useAccountsStore(state => (account ? state.proxies[account.address] : null));

  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();

  const open = () => {
    if (voteProxy && account?.address === voteProxy.getHotAddress()) {
      alert(
        'You are using the hot wallet for a voting proxy. ' +
          'You can only deposit from the cold wallet. ' +
          'Switch to that wallet to continue.'
      );
      return;
    }
    setShowDialog(true);
  };

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
                  variant: 'dialog.desktop',
                  animation: `${fadeIn} 350ms ease`,
                  width: '520px',
                  px: 5,
                  py: 4
                }
          }
        >
          <ModalContent address={account?.address} voteProxy={voteProxy} close={() => setShowDialog(false)} />
        </DialogContent>
      </DialogOverlay>
      <Button variant="mutedOutline" onClick={open} {...props}>
        Deposit
      </Button>
    </>
  );
};

export default Deposit;
