import { Button, Flex, Text } from 'theme-ui';

type Props = {
  onClickConnect: () => void;
  network?: string;
};

export default function ConnectWalletButton({ onClickConnect, network }: Props): React.ReactElement {
  return (
    <Button
      aria-label="Connect network"
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
      <Flex sx={{ alignItems: 'center' }}>
        {/* <Box sx={{ mr: 2 }}>
            <AddressIcon address={address} width="22px" />
          </Box> */}
        <Text data-testid="active-network-name">{network}</Text>
      </Flex>
    </Button>
  );
}
