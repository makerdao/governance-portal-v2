import { Text, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  title: string;
  styles?: ThemeUIStyleObject;
};

export const CardTitle = ({ title, styles }: Props): JSX.Element => (
  <Text as="h3" variant="microHeading" sx={{ fontSize: [3, 5], mt: 2, ...styles }}>
    {title}
  </Text>
);
