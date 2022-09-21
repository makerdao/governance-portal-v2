import AddressIcon from 'modules/address/components/AddressIcon';
import { Button, Box, Flex, Text, Spinner } from 'theme-ui';
import { Address } from 'modules/address/components/Address';

type Props = {
  onClickConnect: () => void;
  address?: string | null;
  pending: boolean;
};

export default function ConnectWalletButton({ onClickConnect, address, pending }: Props): React.ReactElement {
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
                color: 'orangeAttention',
                alignSelf: 'center',
                mr: 2
              }}
            />
            <Text sx={{ color: 'orangeAttention' }}>TX Pending</Text>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center', mr: 2 }}>
            <Box sx={{ mr: 2 }}>
              <AddressIcon address={address} width={22} />
            </Box>
            <Text sx={{ fontFamily: 'body' }} data-testid="connected-address">
              <Address address={address} />
            </Text>
          </Flex>
        )
      ) : (
        <Box mx={2}>Connect wallet</Box>
      )}
    </Button>
  );
}
