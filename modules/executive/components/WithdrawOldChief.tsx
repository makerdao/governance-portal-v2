import { useState } from 'react';
import { Button, Flex, Text, Box, Alert } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useSWR from 'swr';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { fadeIn, slideUp } from 'lib/keyframes';
import TxIndicators from 'modules/app/components/TxIndicators';

import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { useOldChiefFree } from 'modules/mkr/hooks/useOldChiefFree';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { formatValue } from 'lib/string';
import { MainnetSdk } from '@dethcrypto/eth-sdk-client';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { Tokens } from 'modules/web3/constants/tokens';

// Note this only works on mainnet
// TODO: Check that the amounts for allowance are correct
// TODO: Test with cypress
const ModalContent = ({ close, ...props }) => {
  const { account, voteProxyOldContractAddress, voteProxyOldHotAddress, voteProxyOldContract } = useAccount();
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);

  const { chiefOld } = useContracts() as MainnetSdk;

  const { data: allowance, mutate: mutateTokenAllowance } = useTokenAllowance(
    Tokens.IOU_OLD,
    parseUnits('100000000'),
    account,
    voteProxyOldContractAddress ? undefined : chiefOld.address
  );

  const { approve, tx: approveTx, setTxId: resetApprove } = useApproveUnlimitedToken(Tokens.IOU_OLD);

  const allowanceOk = voteProxyOldContract ? true : allowance; // no need for IOU approval when using vote proxy

  const lockedMkrKeyOldChief = voteProxyOldContractAddress || account;

  const { data: lockedMkr } = useSWR(account ? `/user/mkr-locked-old-chief/${account}` : null, () =>
    chiefOld.deposits(lockedMkrKeyOldChief as string)
  );

  const { free, tx: freeTx, setTxId: resetFree } = useOldChiefFree();

  const [transaction, resetTransaction] = allowanceOk ? [freeTx, resetFree] : [approveTx, resetApprove];

  return (
    <BoxWithClose close={close} {...props}>
      <Box>
        {transaction && (
          <Stack sx={{ textAlign: 'center' }}>
            <Text variant="microHeading" color="onBackgroundAlt">
              {transaction.status === 'pending' ? 'Transaction Pending' : 'Confirm Transaction'}
            </Text>

            <Flex sx={{ justifyContent: 'center' }}>
              <TxIndicators.Pending sx={{ width: 6 }} />
            </Flex>

            {transaction.status !== 'pending' && (
              <Box>
                <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
                  Please use your wallet to confirm this transaction.
                </Text>
                <Text
                  sx={{ color: 'muted', cursor: 'pointer', fontSize: 2, mt: 2 }}
                  onClick={() => resetTransaction(null)}
                >
                  Cancel
                </Text>
              </Box>
            )}
          </Stack>
        )}
        {!transaction && allowanceOk && (
          <Stack gap={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Text variant="microHeading" color="onBackgroundAlt">
                Withdraw MKR from Chief
              </Text>
              <Text sx={{ color: '#333333', fontSize: 3, mt: 3 }}>
                You are withdrawing <b>{lockedMkr ? formatValue(lockedMkr) : '---'} MKR</b> from the old Chief
                contract back to your wallet.
              </Text>
            </Box>
            {voteProxyOldContractAddress && voteProxyOldHotAddress && (
              <Alert variant="notice" sx={{ fontWeight: 'normal' }}>
                You are using the hot wallet for a voting proxy. MKR will be withdrawn to the cold wallet.
              </Alert>
            )}
            <Button
              sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
              disabled={!lockedMkr}
              onClick={() => {
                trackButtonClick('withdrawMkrOldChief');
                free(lockedMkr as BigNumber, {
                  mined: () => close(),
                  error: () => close()
                });
              }}
            >
              Withdraw MKR
            </Button>
          </Stack>
        )}
        {!transaction && !allowanceOk && (
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
              onClick={() => {
                trackButtonClick('approveWithdrawOldChief');
                approve(chiefOld.address, {
                  mined: () => mutateTokenAllowance()
                });
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
