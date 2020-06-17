/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Grid } from 'theme-ui';

type Props = {};

/**
 * Expects two children: the first one is the main content, the second one is the sidebar
 */
const SidebarLayout = ({ children, ...otherProps }: React.PropsWithChildren<Props>) => {
  return (
    <Grid
      gap={4}
      sx={theme => ({
        gridTemplateColumns: [
          'auto', // default to a stacked layout on small & medium screens
          'auto',
          `1fr ${theme.sizes.sidebar}px` // use columns for larger screens
        ],
        '& > *': {
          minWidth: 0
        }
      })}
      {...otherProps}
    >
      {children}
    </Grid>
  );
};

export default SidebarLayout;
