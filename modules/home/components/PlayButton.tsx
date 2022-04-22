import { Icon } from '@makerdao/dai-ui-icons';
import { Button, Flex, Text, ThemeUIStyleObject } from 'theme-ui';

type Props = { label: string; onClick: () => void; styles?: ThemeUIStyleObject };

export const PlayButton = ({ label, onClick, styles }: Props): JSX.Element => (
  <Button variant="outline" sx={{ borderRadius: 'round', ...styles }} onClick={onClick}>
    <Flex sx={{ alignItems: 'center' }}>
      <Icon sx={{ mr: 2 }} name="play" size={3} />
      <Text color="text">{label}</Text>
    </Flex>
  </Button>
);
