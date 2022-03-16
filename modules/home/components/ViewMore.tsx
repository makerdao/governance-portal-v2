import { Icon } from '@makerdao/dai-ui-icons';
import { Flex, Text } from 'theme-ui';

type Props = {
  label?: string;
};

export const ViewMore = ({ label = 'View More' }: Props): JSX.Element => {
  return (
    <Flex sx={{ alignItems: 'center', cursor: 'pointer', color: 'text' }}>
      <Text sx={{ fontSize: 2 }}>{label}</Text>
      <Icon name="chevron_right" size={2} ml={2} color="primary" />
    </Flex>
  );
};
