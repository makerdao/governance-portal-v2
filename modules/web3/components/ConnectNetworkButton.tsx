import { Icon } from '@makerdao/dai-ui-icons';
import { Button, Flex, Text } from 'theme-ui';

type Props = {
  onClickConnect: () => void;
  activeNetwork?: string;
};

export default function ConnectWalletButton({ onClickConnect, activeNetwork }: Props): React.ReactElement {
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
        <Flex sx={{ mr: 2 }}>
          <Icon name={activeNetwork} sx={{ width: '22px', height: '22px' }} />
        </Flex>
        <Text data-testid="active-network-name">{activeNetwork}</Text>
      </Flex>
    </Button>
  );
}
