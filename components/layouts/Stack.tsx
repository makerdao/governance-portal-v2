/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Grid } from 'theme-ui';

type Props = {};

const StackLayout = ({ children }: React.PropsWithChildren<Props>) => {
  return (
    <Grid gap="4" sx={{ width: '100%' }}>
      {children}
    </Grid>
  );
};

export default StackLayout;
