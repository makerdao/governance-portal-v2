import { Text } from 'theme-ui';

type Props = {
  children: string | JSX.Element;
  testId?: string;
};

export const StatusText = (props: Props): JSX.Element => (
  <Text
    as="p"
    variant="caps"
    datatest-id={props.testId}
    sx={{ textAlign: 'center', px: [3, 4], wordBreak: 'break-word' }}
  >
    {props.children}
  </Text>
);
