/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import { Button, Flex, Text, Box, Link } from 'theme-ui';
import { DialogOverlay, DialogContent } from 'modules/app/components/Dialog';

import Stack from 'modules/app/components/layout/layouts/Stack';
import { MKRInput } from './MKRInput';
import TxIndicators from 'modules/app/components/TxIndicators';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { useLockSky } from '../hooks/useLockSky';
import { Tokens } from 'modules/web3/constants/tokens';
import { useChainId } from 'wagmi';
import { chiefAddress } from 'modules/contracts/generated';
import { TxStatus } from 'modules/web3/constants/transaction';
import { useSkyBalance } from '../hooks/useSkyBalance';

const ModalContent = ({
  close,
  mutateLockedSky
}: {
  close: () => void;
  mutateLockedSky?: () => void;
}): React.ReactElement => {
  const [skyToDeposit, setSkyToDeposit] = useState(0n);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.IDLE);

  const { account } = useAccount();
  const chainId = useChainId();
  const { data: skyBalance } = useSkyBalance(account);

  const { data: chiefAllowance, mutate: mutateTokenAllowance } = useTokenAllowance(
    Tokens.SKY,
    100000000n,
    account,
    chiefAddress[chainId]
  );

  const approve = useApproveUnlimitedToken({
    name: Tokens.SKY,
    addressToApprove: chiefAddress[chainId],
    onStart: () => {
      setTxStatus(TxStatus.LOADING);
    },
    onSuccess: () => {
      // Once the approval is successful, return to tx idle so we can lock
      setTxStatus(TxStatus.IDLE);
      mutateTokenAllowance();
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
    }
  });

  const lock = useLockSky({
    skyToDeposit,
    onStart: () => {
      setTxStatus(TxStatus.LOADING);
    },
    onSuccess: () => {
      setTxStatus(TxStatus.SUCCESS);
      mutateLockedSky?.();
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
    },
    enabled: !!chiefAllowance
  });

  return (
    <BoxWithClose close={close}>
      <Box>
        {txStatus !== TxStatus.IDLE && (
          <Stack sx={{ textAlign: 'center' }}>
            <Text as="p" variant="microHeading">
              {txStatus === TxStatus.LOADING
                ? 'Transaction Pending'
                : txStatus === TxStatus.SUCCESS
                ? 'Transaction Successful'
                : txStatus === TxStatus.ERROR
                ? 'Transaction Error'
                : 'Confirm Transaction'}
            </Text>

            <Flex sx={{ justifyContent: 'center' }}>
              {txStatus === TxStatus.SUCCESS ? (
                <TxIndicators.Success sx={{ width: 6 }} />
              ) : txStatus === TxStatus.ERROR ? (
                <TxIndicators.Failed sx={{ width: 6 }} />
              ) : (
                <TxIndicators.Pending sx={{ width: 6 }} />
              )}
            </Flex>

            {txStatus === TxStatus.SUCCESS && (
              <Button variant="outline" onClick={close} sx={{ mt: 3 }}>
                Close
              </Button>
            )}

            {txStatus === TxStatus.INITIALIZED && (
              <Box>
                <Text sx={{ color: 'secondaryEmphasis', fontSize: 3 }}>
                  Please use your wallet to confirm this transaction.
                </Text>
                <Text
                  as="p"
                  sx={{ color: 'secondary', cursor: 'pointer', fontSize: 2, mt: 2 }}
                  onClick={() => setTxStatus(TxStatus.IDLE)}
                >
                  Cancel
                </Text>
              </Box>
            )}
          </Stack>
        )}
        {txStatus === TxStatus.IDLE && chiefAllowance && (
          <Stack gap={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Text as="p" variant="microHeading">
                Deposit into voting contract
              </Text>
              <Text as="p" sx={{ color: 'secondaryEmphasis', fontSize: 3, mt: 3 }}>
                Input the amount of SKY to deposit into the voting contract.
              </Text>
            </Box>

            <Box>
              <MKRInput value={skyToDeposit} onChange={setSkyToDeposit} balance={skyBalance} />
            </Box>

            <Button
              data-testid="button-deposit-sky"
              sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
              disabled={
                skyToDeposit === 0n || skyToDeposit > (skyBalance || 0n) || lock.isLoading || !lock.prepared
              }
              onClick={() => {
                setTxStatus(TxStatus.INITIALIZED);
                lock.execute();
              }}
            >
              Deposit SKY
            </Button>
          </Stack>
        )}
        {txStatus === TxStatus.IDLE && !chiefAllowance && (
          <Stack gap={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Text as="p" variant="microHeading">
                Approve voting contract
              </Text>
              <Text as="p" sx={{ color: 'secondaryEmphasis', fontSize: 3, mt: 3 }}>
                Approve the transfer of SKY to the voting contract.
              </Text>
            </Box>

            <Button
              sx={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}
              disabled={approve.isLoading || !approve.prepared}
              onClick={() => {
                setTxStatus(TxStatus.INITIALIZED);
                approve.execute();
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

const Deposit = ({ link, mutateLockedSky }: { link?: string; mutateLockedSky?: () => void }): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);

  const open = () => {
    setShowDialog(true);
  };

  return (
    <>
      <DialogOverlay isOpen={showDialog} onDismiss={() => setShowDialog(false)}>
        <DialogContent ariaLabel="Executive Vote" widthDesktop="520px">
          <ModalContent close={() => setShowDialog(false)} mutateLockedSky={mutateLockedSky} />
        </DialogContent>
      </DialogOverlay>
      {link ? (
        <Link
          onClick={() => {
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
