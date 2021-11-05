import AddressIcon from 'modules/address/components/AddressIcon';
import { formatAddress } from 'lib/utils';
import { useEffect, useState } from 'react';
import { Button, Box, Flex, Text, jsx, Spinner } from 'theme-ui';
import { getENS } from 'modules/web3/ens';

type Props = {
  onClickConnect: () => void;
  address?: string;
  pending: boolean;
};

export default function ConnectWalletButton({ onClickConnect, address, pending }: Props): React.ReactElement {
  const [addressFormated, setAddressFormatted] = useState(formatAddress(address || ''));

  async function fetchENSName(address: string) {
    try {
      if (!address) {
        return;
      }

      const ens = await getENS(address);
      setAddressFormatted(ens);
    } catch (e) {
      setAddressFormatted(formatAddress(address));
    }
  }

  useEffect(() => {
    if (address) {
      fetchENSName(address);
    }
  }, [address]);

  return (
    <Button
      aria-label="Connect wallet"
      sx={{
        variant: 'buttons.card',
        borderRadius: 'round',
        color: 'textSecondary',
        p: 2,
        px: [2, 3],
        py: 2,
        alignSelf: 'flex-end',
        '&:hover': {
          color: 'text',
          borderColor: 'onSecondary',
          backgroundColor: 'surface'
        }
      }}
      onClick={onClickConnect}
    >
      {address ? (
        pending ? (
          <Flex sx={{ display: 'inline-flex' }}>
            <Spinner
              size={16}
              sx={{
                color: 'mutedOrange',
                alignSelf: 'center',
                mr: 2
              }}
            />
            <Text sx={{ color: 'mutedOrange' }}>TX Pending</Text>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center', mr: 2 }}>
            <Box sx={{ mr: 2 }}>
              <AddressIcon address={address} width="22px" />
            </Box>
            <Text sx={{ fontFamily: 'body' }}>{addressFormated}</Text>
          </Flex>
        )
      ) : (
        <Box mx={2}>Connect wallet</Box>
      )}
    </Button>
  );
}
