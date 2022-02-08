import { Flex, Text, NavLink, Button } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fadeIn, slideUp } from 'lib/keyframes';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

export type ChainIdError = null | 'network mismatch' | 'unsupported network';

const NetworkAlertModal = ({
  chainIdError,
  deactivate
}: {
  chainIdError: ChainIdError;
  deactivate: () => void;
}): JSX.Element | null => {
  const bpi = useBreakpointIndex();
  const { network } = useActiveWeb3React();

  if (chainIdError === 'network mismatch') {
    return (
      <DialogOverlay isOpen={!!chainIdError} onDismiss={deactivate}>
        <DialogContent
          aria-label="Network Mismatch"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
          }
        >
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
        <DialogContent
          aria-label="Unsupported Network"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
          }
        >
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

export default NetworkAlertModal;
