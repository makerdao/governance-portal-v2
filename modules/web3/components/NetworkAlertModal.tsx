/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Text, NavLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';

export type ChainIdError = null | 'network mismatch' | 'unsupported network';

export const NetworkAlertModal = ({
  chainIdError,
  deactivate
}: {
  chainIdError: ChainIdError;
  deactivate: () => void;
}): JSX.Element | null => {
  const { network } = useWeb3();

  if (chainIdError === 'network mismatch') {
    return (
      <DialogOverlay isOpen={!!chainIdError} onDismiss={deactivate}>
        <DialogContent aria-label="Network Mismatch">
          <Flex sx={{ flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Flex sx={{ alignItems: 'center' }}>
              <Text variant="microHeading" sx={{ alignItems: 'center' }}>
                Warning
              </Text>
              <Icon name="warning" sx={{ ml: 3, width: '23px', height: '23px' }} />
            </Flex>

            <Text sx={{ mt: 3 }}>
              Your wallet and this page are connected to different networks. To have the page match your
              wallet&apos;s network ({network}),{' '}
              <NavLink href={`/?network=${network}`} p={0} sx={{}}>
                click here.
              </NavLink>
            </Text>
          </Flex>
        </DialogContent>
      </DialogOverlay>
    );
  }

  if (chainIdError === 'unsupported network') {
    return (
      <DialogOverlay isOpen={!!chainIdError} onDismiss={deactivate}>
        <DialogContent aria-label="Unsupported Network">
          <Flex sx={{ flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Flex sx={{ alignItems: 'center' }}>
              <Text variant="microHeading" sx={{ alignItems: 'center' }}>
                Warning
              </Text>
              <Icon name="warning" sx={{ ml: 3, width: '23px', height: '23px' }} />
            </Flex>

            <Text sx={{ mt: 3 }}>
              Your wallet is connected to an unsupported network, please switch it to{' '}
              {SupportedNetworks.MAINNET} or {SupportedNetworks.GOERLI} to continue.
            </Text>
            {/* <Button onClick={() => handleSwitchNetwork(SupportedNetworks.MAINNET)}>Switch to mainnet</Button>
            <Button onClick={() => handleSwitchNetwork(SupportedNetworks.GOERLI)}>Switch to goerli</Button> */}
          </Flex>
        </DialogContent>
      </DialogOverlay>
    );
  }

  return null;
};
