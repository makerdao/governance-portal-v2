/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import { Box, Text } from 'theme-ui';
import { Delegate, DelegateInfo, DelegatePaginated } from '../../types';
import { useMkrDelegatedByUser } from 'modules/sky/hooks/useSkyDelegatedByUser';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { InputDelegateSky, TxDisplay } from 'modules/delegates/components';
import { useDelegateFree } from 'modules/delegates/hooks/useDelegateFree';
import { useAccount } from 'modules/app/hooks/useAccount';
import { formatValue } from 'lib/string';
import DelegateAvatarName from '../DelegateAvatarName';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { TxStatus } from 'modules/web3/constants/transaction';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate | DelegatePaginated | DelegateInfo;
  mutateTotalStaked: (amount?: bigint) => void;
  mutateSkyDelegated: () => void;
  refetchOnDelegation?: boolean;
};

export const UndelegateModal = ({
  isOpen,
  onDismiss,
  delegate,
  mutateTotalStaked,
  mutateSkyDelegated,
  refetchOnDelegation = true
}: Props): JSX.Element => {
  const { account } = useAccount();
  const voteDelegateAddress = delegate.voteDelegateAddress;
  const [mkrToWithdraw, setMkrToWithdraw] = useState(0n);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.IDLE);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: mkrDelegatedData } = useMkrDelegatedByUser(account, voteDelegateAddress);
  const stakingEngineDelegated = mkrDelegatedData?.stakingEngineDelegationAmount;
  const directDelegated = mkrDelegatedData?.directDelegationAmount;

  const free = useDelegateFree({
    voteDelegateAddress,
    mkrToWithdraw,
    onStart: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.LOADING);
    },
    onSuccess: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.SUCCESS);
      refetchOnDelegation ? mutateTotalStaked() : mutateTotalStaked(mkrToWithdraw * -1n);
      mutateSkyDelegated();
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
    },
    enabled: !!mkrToWithdraw
  });

  const onClose = () => {
    setTxStatus(TxStatus.IDLE);
    setTxHash(undefined);
    onDismiss();
  };

  return (
    <>
      <DialogOverlay isOpen={isOpen} onDismiss={onClose}>
        <DialogContent widthDesktop="580px" ariaLabel="Undelegate modal">
          <BoxWithClose close={onClose}>
            <Box>
              {txStatus !== TxStatus.IDLE ? (
                <TxDisplay
                  txStatus={txStatus}
                  setTxStatus={setTxStatus}
                  txHash={txHash}
                  setTxHash={setTxHash}
                  onDismiss={onClose}
                  title={'Undelegating SKY'}
                  description={`You undelegated ${formatValue(mkrToWithdraw, 'wad', 6)} from ${
                    delegate.name
                  }`}
                >
                  <Box sx={{ textAlign: 'left', margin: '0 auto', p: 3 }}>
                    <DelegateAvatarName delegate={delegate} />
                  </Box>
                </TxDisplay>
              ) : (
                <>
                  <InputDelegateSky
                    title="Withdraw from delegate contract"
                    description="Input the amount of SKY to withdraw from the delegate contract."
                    onChange={setMkrToWithdraw}
                    balance={directDelegated}
                    buttonLabel="Undelegate SKY"
                    onClick={() => {
                      setTxStatus(TxStatus.INITIALIZED);
                      free.execute();
                    }}
                    disabled={free.isLoading || !free.prepared}
                    showAlert={false}
                    prepareError={free.prepareError}
                    disclaimer={
                      stakingEngineDelegated && stakingEngineDelegated > 0n ? (
                        <Text variant="smallText" sx={{ color: 'secondaryEmphasis', mt: 3 }}>
                          Your {formatValue(stakingEngineDelegated)} SKY delegated through the Staking Engine
                          must be undelegated from the{' '}
                          <ExternalLink title="Sky app" href="https://app.sky.money/?widget=staking-engine">
                            <span>Sky app</span>
                          </ExternalLink>
                          .
                        </Text>
                      ) : undefined
                    }
                  />
                </>
              )}
            </Box>
          </BoxWithClose>
        </DialogContent>
      </DialogOverlay>
    </>
  );
};
