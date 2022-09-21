import { Icon } from '@makerdao/dai-ui-icons';
import { Button, Flex, Text } from 'theme-ui';

type Props = {
  onClickConnect: () => void;
  activeNetwork?: string;
  disabled?: boolean;
};

export default function ConnectNetworkButton({
  onClickConnect,
  activeNetwork,
  disabled
}: Props): React.ReactElement {
  return (
    <Button
      aria-label="Connect network"
      disabled={disabled}
      sx={{
        variant: 'buttons.card',
        borderRadius: 'round',
        color: 'textSecondary',
        p: 2,
        px: [2, 3],
        alignSelf: 'flex-end',
        '&:hover': {
          color: 'text',
          borderColor: 'onSecondary',
          backgroundColor: 'surface'
        },
        '&:disabled': {
          color: 'textSecondary',
          borderColor: 'secondary',
          backgroundColor: 'surface'
        }
      }}
      onClick={onClickConnect}
    >
      <Flex sx={{ alignItems: 'center' }}>
        <Flex sx={{ mr: [1, 2] }}>
          <Icon name={activeNetwork} sx={{ width: '22px', height: '22px' }} />
        </Flex>
        <Text data-testid="active-network-name">{activeNetwork}</Text>
      </Flex>
    </Button>
  );
}
