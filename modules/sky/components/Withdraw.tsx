/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import { Button, Flex, Text, Box, Link } from 'theme-ui';
import { DialogOverlay, DialogContent } from 'modules/app/components/Dialog';

import Stack from 'modules/app/components/layout/layouts/Stack';
import { SkyTokenInput } from './SkyTokenInput';
import TxIndicators from 'modules/app/components/TxIndicators';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { useLockedSky } from 'modules/sky/hooks/useLockedSky';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useFree } from '../hooks/useFree';
import { TxStatus } from 'modules/web3/constants/transaction';

const ModalContent = ({ close, mutateLockedMkr, ...props }) => {
  const { account } = useAccount();

  const [skyToWithdraw, setSkyToWithdraw] = useState(0n);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.IDLE);

  const { data: lockedSky } = useLockedSky(account);

  const free = useFree({
    skyToWithdraw,
    onStart: () => {
      setTxStatus(TxStatus.LOADING);
    },
    onSuccess: () => {
      setTxStatus(TxStatus.SUCCESS);
      mutateLockedMkr?.();
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
    },
    enabled: !!skyToWithdraw
  });

  return (
    <BoxWithClose close={close} {...props}>
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
                <Text as="p" sx={{ color: 'secondaryEmphasis', fontSize: 3 }}>
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
        {txStatus === TxStatus.IDLE && (
          <Stack gap={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Text as="p" variant="microHeading" mb={2}>
                Withdraw from voting contract
              </Text>
              <Text as="p" sx={{ color: 'secondaryEmphasis', fontSize: 3 }}>
                Input the amount of SKY to withdraw from the voting contract.
              </Text>
            </Box>

            <Box>
              <SkyTokenInput
                onChange={setSkyToWithdraw}
                balance={lockedSky}
                value={skyToWithdraw}
                balanceText="SKY in contract:"
              />
            </Box>

            <Button
              sx={{ flexDirection: 'column', width: '100%', alignItems: 'center', mt: 3 }}
              disabled={
                skyToWithdraw === 0n ||
                !lockedSky ||
                skyToWithdraw > lockedSky ||
                free.isLoading ||
                !free.prepared
              }
              data-testid="button-withdraw-sky"
              onClick={() => {
                setTxStatus(TxStatus.INITIALIZED);
                free.execute();
              }}
            >
              Withdraw SKY
            </Button>
          </Stack>
        )}
      </Box>
    </BoxWithClose>
  );
};

const Withdraw = (props): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <DialogOverlay isOpen={showDialog} onDismiss={() => setShowDialog(false)}>
        <DialogContent ariaLabel="Executive Vote" widthDesktop="520px">
          <ModalContent
            sx={{ px: [3, null] }}
            close={() => setShowDialog(false)}
            mutateLockedMkr={props.mutateLockedMkr}
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
