/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Grid } from 'theme-ui';

type Props = {};

const DetailsPageLayout = ({ children }: React.PropsWithChildren<Props>) => {
  return (
    <Grid
      py="5"
      gap="5"
      sx={{
        gridTemplateColumns: [
          'auto', // default to a stacked layout on small screens
          '1fr 256px' // use columns for larger screens
        ]
      }}
    >
      {children}
    </Grid>
  );
};

export default DetailsPageLayout;
