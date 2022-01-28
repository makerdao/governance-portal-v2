import { useState } from 'react';
import { Button, Flex, Text, Box, Link } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import shallow from 'zustand/shallow';

import { slideUp } from 'lib/keyframes';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { MKRInput } from './MKRInput';
import TxIndicators from 'modules/app/components/TxIndicators';
import { fadeIn } from 'lib/keyframes';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';

const ModalContent = ({ close }: { close: () => void }): React.ReactElement => {
  const [mkrToDeposit, setMkrToDeposit] = useState(BigNumber.from(0));
  const [txId, setTxId] = useState(null);
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);
  const { account, voteProxyContractAddress, voteProxyColdAddress, voteProxyContract } = useAccount();
  const { data: mkrBalance } = useMkrBalance(account);

  const { mutate: mutateLocked } = useLockedMkr(account, voteProxyContractAddress);
  const { chief } = useContracts();
  const approveMKR = useApproveUnlimitedToken('mkr');

  const { data: chiefAllowance, mutate: mutateAllowance } = useTokenAllowance(
    'mkr',
    parseUnits('100000000'),
    account,
    account === voteProxyColdAddress ? (voteProxyContractAddress as string) : chief.address
  );

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  return (
    <BoxWithClose close={close}>
      <Box>
        {tx && (
          <Stack sx={{ textAlign: 'center' }}>
            <Text as="p" variant="microHeading" color="onBackgroundAlt">
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
                  as="p"
                  sx={{ color: 'muted', cursor: 'pointer', fontSize: 2, mt: 2 }}
                  onClick={() => setTxId(null)}
                >
                  Cancel
                </Text>
              </Box>
            )}
          </Stack>
        )}
        {!tx && chiefAllowance && (
          <Stack gap={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Text as="p" variant="microHeading" color="onBackgroundAlt">
                Deposit into voting contract
              </Text>
              <Text as="p" sx={{ color: 'mutedAlt', fontSize: 3 }}>
                Input the amount of MKR to deposit into the voting contract.
              </Text>
            </Box>

            <Box>
              <MKRInput value={mkrToDeposit} onChange={setMkrToDeposit} balance={mkrBalance} />
            </Box>

            <Button
              data-testid="button-deposit-mkr"
              sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
              disabled={mkrToDeposit.eq(0) || mkrToDeposit.gt(mkrBalance || BigNumber.from(0))}
              onClick={async () => {
                trackButtonClick('DepositMkr');
                const lockTxCreator = voteProxyContract
                  ? () => voteProxyContract.lock(mkrToDeposit)
                  : () => chief.lock(mkrToDeposit);
                const txId = await track(lockTxCreator, account, 'Depositing MKR', {
                  mined: txId => {
                    // Mutate locked state
                    mutateLocked();
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
        )}
        {!tx && !chiefAllowance && (
          <Stack gap={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Text as="p" variant="microHeading" color="onBackgroundAlt">
                Approve voting contract
              </Text>
              <Text as="p" sx={{ color: 'mutedAlt', fontSize: 3, mt: 3 }}>
                Approve the transfer of MKR to the voting contract.
              </Text>
            </Box>

            <Button
              sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
              onClick={async () => {
                trackButtonClick('approveDeposit');
                const contractToApprove = voteProxyContractAddress || chief.address;
                const approveTxCreator = () => approveMKR(contractToApprove);

                const txId = await track(approveTxCreator, account, 'Granting MKR approval', {
                  mined: txId => {
                    transactionsApi.getState().setMessage(txId, 'Granted MKR approval');
                    mutateAllowance();
                    setTxId(null);
                  },
                  error: () => {
                    transactionsApi.getState().setMessage(txId, 'MKR approval failed');
                    setTxId(null);
                  }
                });
                setTxId(txId);
              }}
              data-testid="deposit-approve-button"
            >
              Approve
            </Button>
          </Stack>
        )}
      </Box>
    </BoxWithClose>
  );
};

const Deposit = ({ link }: { link?: string }): JSX.Element => {
  const { account, voteProxyContractAddress, voteProxyHotAddress } = useAccount();
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);
  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();

  const open = () => {
    if (account && voteProxyContractAddress && account === voteProxyHotAddress) {
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
          <ModalContent close={() => setShowDialog(false)} />
        </DialogContent>
      </DialogOverlay>
      {link ? (
        <Link
          onClick={() => {
            trackButtonClick('btn-click');
            open();
          }}
          sx={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
          {link}
        </Link>
      ) : (
        <Button
          variant="mutedOutline"
          onClick={() => {
            trackButtonClick('OpenDepositModal');
            open();
          }}
          data-testid="deposit-button"
        >
          Deposit
        </Button>
      )}
    </>
  );
};

export default Deposit;
