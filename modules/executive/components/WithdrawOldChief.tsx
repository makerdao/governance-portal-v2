import { useState } from 'react';
import { Button, Flex, Text, Box, Alert } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import shallow from 'zustand/shallow';
import useSWR from 'swr';
import Stack from 'modules/app/components/layout/layouts/Stack';
import getMaker, { MKR, getNetwork } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import TxIndicators from 'modules/app/components/TxIndicators';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import oldChiefAbi from 'lib/abis/oldChiefAbi.json';
import oldVoteProxyAbi from 'lib/abis/oldVoteProxyAbi.json';
import oldIouAbi from 'lib/abis/oldIouAbi.json';
import { oldIouAddress } from 'lib/constants';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { useContractAddress } from 'modules/web3/hooks/useContractAddress';
import { useAccount } from 'modules/app/hooks/useAccount';

const ModalContent = ({ close, ...props }) => {
  const { account, oldVoteProxyContractAddress } = useAccount();

  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);
  const [txId, setTxId] = useState(null);
  const oldChiefAddress = useContractAddress('chiefOld');
  const approveOldIOU = useApproveUnlimitedToken('iouOld');

  const { data: allowanceOk } = useSWR<{ data: boolean }>(
    ['/user/iou-allowance-old-chief', account, !!oldVoteProxyAbi],
    (_, address) =>
      oldVoteProxyContractAddress
        ? Promise.resolve(true) // no need for IOU approval when using vote proxy
        : getMaker()
            .then(maker =>
              maker
                .service('smartContract')
                .getContractByAddressAndAbi(oldIouAddress[getNetwork()], oldIouAbi)
                .allowance(address, oldChiefAddress)
            )
            .then(val => MKR(val).gt('10e26')) // greater than 100,000,000 MKR
  );
  const lockedMkrKeyOldChief = oldVoteProxyContractAddress || account;
  const { data: lockedMkr } = useSWR(['/user/mkr-locked-old-chief', lockedMkrKeyOldChief], (_, address) =>
    getMaker().then(maker =>
      maker
        .service('smartContract')
        .getContractByAddressAndAbi(oldChiefAddress, oldChiefAbi)
        .deposits(lockedMkrKeyOldChief)
        .then(MKR.wei)
    )
  );

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  return (
    <BoxWithClose close={close} {...props}>
      <Box>
        {tx && (
          <Stack sx={{ textAlign: 'center' }}>
            <Text variant="microHeading" color="onBackgroundAlt">
              {tx.status === 'pending' ? 'Transaction Pending' : 'Confirm Transaction'}
            </Text>

            <Flex sx={{ justifyContent: 'center' }}>
              <TxIndicators.Pending sx={{ width: 6 }} />
            </Flex>

            {tx.status !== 'pending' && (
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
        )}
        {!tx && allowanceOk && (
          <Stack gap={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Text variant="microHeading" color="onBackgroundAlt">
                Withdraw MKR from Chief
              </Text>
              <Text sx={{ color: '#333333', fontSize: 3, mt: 3 }}>
                You are withdrawing <b>{lockedMkr ? lockedMkr.toBigNumber().toFormat(6) : '---'} MKR</b> from
                the old Chief contract back to your wallet.
              </Text>
            </Box>
            {oldVoteProxyContract && oldVoteProxyContract.role === 'hot' && (
              <Alert variant="notice" sx={{ fontWeight: 'normal' }}>
                You are using the hot wallet for a voting proxy. MKR will be withdrawn to the cold wallet.
              </Alert>
            )}
            <Button
              sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
              disabled={!lockedMkr}
              onClick={async () => {
                trackButtonClick('withdrawMkrOldChief');
                const maker = await getMaker();

                const freeTxCreator = oldVoteProxyContractAddress
                  ? () =>
                      maker
                        .service('smartContract')
                        .getContractByAddressAndAbi(oldVoteProxyContractAddress, oldVoteProxyAbi)
                        .freeAll()
                  : () =>
                      maker
                        .service('smartContract')
                        .getContractByAddressAndAbi(oldChiefAddress, oldChiefAbi)
                        .free(lockedMkr.toFixed('wei'));

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
        )}
        {!tx && !allowanceOk && (
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
              data-testid="button-approve-voting-contract"
              sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
              onClick={async () => {
                trackButtonClick('approveWithdrawOldChief');
                const approveTxCreator = () => approveOldIOU(oldChiefAddress);

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
            >
              Approve
            </Button>
          </Stack>
        )}
      </Box>
    </BoxWithClose>
  );
};

const WithdrawOldChief = (props): JSX.Element => {
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
          <ModalContent sx={{ px: [3, null] }} close={() => setShowDialog(false)} />
        </DialogContent>
      </DialogOverlay>
      <Button
        onClick={() => setShowDialog(true)}
        {...props}
        variant="primary"
        sx={{
          height: '26px',
          py: 0,
          mx: 1,
          textTransform: 'uppercase',
          borderRadius: 'small',
          fontWeight: 'bold',
          fontSize: '10px'
        }}
      >
        Withdraw
      </Button>
    </>
  );
};

export default WithdrawOldChief;
