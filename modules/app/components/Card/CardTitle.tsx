import { Text, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  title: string;
  styles?: ThemeUIStyleObject;
  dataTestId?: string
};

export const CardTitle = ({ title, styles, dataTestId = 'card-title' }: Props): JSX.Element => (
  <Text as="h3" variant="microHeading" data-testid={dataTestId} sx={{ fontSize: [3, 5], mt: 2, ...styles }}>
    {title}
  </Text>
);
