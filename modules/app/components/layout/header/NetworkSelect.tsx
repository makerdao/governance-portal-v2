/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React, { useState, useCallback } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Box, Flex, Text, Close, ThemeUICSSObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ConnectNetworkButton from 'modules/web3/components/ConnectNetworkButton';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { CHAIN_INFO } from 'modules/web3/constants/networks';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { isSupportedChain } from 'modules/web3/helpers/chain';
import { DialogContent, DialogOverlay } from '../../Dialog';

export type ChainIdError = null | 'network mismatch' | 'unsupported network';

const walletButtonStyle: ThemeUICSSObject = {
  cursor: 'pointer',
  width: '100%',
  p: 3,
  border: '1px solid',
  borderColor: 'secondaryMuted',
  borderRadius: 'medium',
  mb: 2,
  flexDirection: 'row',
  alignItems: 'center',
  '&:hover': {
    color: 'text',
    backgroundColor: 'background'
  }
};

const closeButtonStyle: ThemeUICSSObject = {
  height: 4,
  width: 4,
  p: 0,
  position: 'relative',
  top: '-4px',
  left: '8px',
  ml: 'auto'
};

const NetworkSelect = (): React.ReactElement => {
  const { chainId, account, connector } = useWeb3();
  const [error, setError] = useState<any>(undefined);

  const switchChain = useCallback(
    async (desiredChainId: number) => {
      // if we're already connected to the desired chain, return
      if (desiredChainId === chainId) {
        setError(undefined);
        return;
      }

      // if they want to connect to the default chain and we're already connected, return
      if (desiredChainId === -1 && chainId !== undefined) {
        setError(undefined);
        return;
      }

      try {
        await connector.activate(desiredChainId === -1 ? undefined : desiredChainId);
        setError(undefined);
      } catch (err) {
        setError(err);
      }
    },
    [connector, chainId, setError]
  );

  // We can only switch MM network if injected connector is active
  const disabled = !account;

  const [showDialog, setShowDialog] = useState(false);

  const close = () => setShowDialog(false);
  const bpi = useBreakpointIndex();

  const networkOptions = Object.keys(CHAIN_INFO)
    .filter(
      k => ![SupportedChainId.GOERLIFORK].includes(CHAIN_INFO[k].chainId) && CHAIN_INFO[k].type === 'normal'
    )
    .map(chainKey => (
      <Flex
        sx={walletButtonStyle}
        key={CHAIN_INFO[chainKey].label}
        onClick={() => {
          switchChain(CHAIN_INFO[chainKey].chainId);
          setShowDialog(false);
        }}
      >
        <Icon name={CHAIN_INFO[chainKey].label} sx={{ width: '22px', height: '22px' }} />
        <Text sx={{ ml: 3 }}>{CHAIN_INFO[chainKey].label}</Text>
      </Flex>
    ));

  return (
    <Box sx={{ ml: ['auto', 3, 0] }}>
      {chainId && (
        <ConnectNetworkButton
          onClickConnect={() => {
            setError(undefined);
            setShowDialog(true);
          }}
          activeNetwork={isSupportedChain(chainId) ? CHAIN_INFO[chainId].label : 'Unsupported Network'}
          disabled={disabled}
        />
      )}

      <DialogOverlay isOpen={showDialog} onDismiss={close}>
        <DialogContent aria-label="Change Network" widthDesktop="400px">
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Text variant="microHeading">Switch Network</Text>
            <Close sx={closeButtonStyle} aria-label="close" onClick={close} />
          </Flex>
          {chainId && networkOptions}
          {error && (
            <Text sx={{ mt: 2 }} variant="error">
              An error has occured.
            </Text>
          )}
        </DialogContent>
      </DialogOverlay>
    </Box>
  );
};

export default NetworkSelect;
