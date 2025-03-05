/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React, { useState } from 'react';
import { Box, Flex, Text, Close, ThemeUICSSObject } from 'theme-ui';
import ConnectNetworkButton from 'modules/web3/components/ConnectNetworkButton';
import { DialogContent, DialogOverlay } from '../../Dialog';
import { useChains, useClient, useSwitchChain } from 'wagmi';
import Icon from 'modules/app/components/Icon';

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
  const client = useClient();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const [error, setError] = useState<any>(undefined);

  const handleSwitchChain = (chainId: number) => {
    switchChain(
      { chainId },
      {
        onSettled: () => {
          close();
        }
      }
    );
  };

  const [showDialog, setShowDialog] = useState(false);

  const close = () => setShowDialog(false);

  const networkOptions = chains.map(chain => (
    <Flex sx={walletButtonStyle} key={chain.id} onClick={() => handleSwitchChain(chain.id)}>
      <Icon name="ethereum" sx={{ width: '22px', height: '22px' }} />
      <Text sx={{ ml: 3 }}>{chain.name}</Text>
    </Flex>
  ));

  return (
    <Box sx={{ ml: ['auto', 3, 0] }}>
      <ConnectNetworkButton
        onClickConnect={() => {
          setError(undefined);
          setShowDialog(true);
        }}
        activeNetwork={client?.chain.name || 'Ethereum'}
      />

      <DialogOverlay isOpen={showDialog} onDismiss={close}>
        <DialogContent ariaLabel="Change Network" widthDesktop="400px">
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Text variant="microHeading">Switch Network</Text>
            <Close sx={closeButtonStyle} aria-label="close" onClick={close} />
          </Flex>
          {networkOptions}
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
