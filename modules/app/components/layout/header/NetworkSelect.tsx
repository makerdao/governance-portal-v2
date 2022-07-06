import React, { useState } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Box, Flex, Text, Close, ThemeUICSSObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { DialogOverlay, DialogContent } from '@reach/dialog';

import { fadeIn, slideUp } from 'lib/keyframes';
import ConnectNetworkButton from 'modules/web3/components/ConnectNetworkButton';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { CHAIN_INFO } from 'modules/web3/constants/networks';
import { switchToNetwork } from 'modules/web3/helpers/switchToNetwork';
import { SupportedChainId, GaslessChainId } from 'modules/web3/constants/chainID';

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
  const { library, chainId, account } = useActiveWeb3React();
  // We can only switch MM network if injected connector is active
  const disabled = !account;

  const [showDialog, setShowDialog] = useState(false);

  const close = () => setShowDialog(false);
  const bpi = useBreakpointIndex();

  const networkOptions = Object.keys(CHAIN_INFO)
    .filter(k => ![SupportedChainId.GOERLIFORK, ...Object.values(GaslessChainId)].includes(CHAIN_INFO[k].chainId))
    .map(chainKey => (
      <Flex
        sx={walletButtonStyle}
        key={CHAIN_INFO[chainKey].label}
        onClick={() => {
          switchToNetwork({ chainId: CHAIN_INFO[chainKey].chainId, library });
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
            setShowDialog(true);
          }}
          activeNetwork={CHAIN_INFO[chainId].label}
          disabled={disabled}
        />
      )}

      <DialogOverlay isOpen={showDialog} onDismiss={close} sx={{ zIndex: 1001 }}>
        <DialogContent
          aria-label="Change Network"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
          }
        >
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Text variant="microHeading" color="onBackgroundAlt">
              Switch Network
            </Text>
            <Close sx={closeButtonStyle} aria-label="close" onClick={close} />
          </Flex>
          {chainId && networkOptions}
        </DialogContent>
      </DialogOverlay>
    </Box>
  );
};

export default NetworkSelect;
