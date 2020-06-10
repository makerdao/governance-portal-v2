/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Grid } from 'theme-ui';

type Props = {};

/**
 * Expects two children: the first one is the main content, the second one is the sidebar
 */
const SidebarLayout = ({ children }: React.PropsWithChildren<Props>) => {
  return (
    <Grid
      py={4}
      gap={4}
      sx={{
        gridTemplateColumns: [
          'auto', // default to a stacked layout on small & medium screens
          'auto',
          '1fr 256px' // use columns for larger screens
        ]
      }}
    >
      {children}
    </Grid>
  );
};

export default SidebarLayout;
