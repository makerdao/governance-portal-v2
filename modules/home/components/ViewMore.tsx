import { Icon } from '@makerdao/dai-ui-icons';
import { Flex, Text } from 'theme-ui';

type Props = {
  label?: string;
  icon?: string;
};

export const ViewMore = ({ label = 'View more', icon = 'chevron_right' }: Props): JSX.Element => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        cursor: 'pointer',
        color: 'text',
        ':hover > svg': { transform: 'translateX(3px)' }
      }}
    >
      <Text sx={{ fontSize: 2 }}>{label}</Text>
      <Icon name={icon} size={2} ml={2} color="primary" />
    </Flex>
  );
};
