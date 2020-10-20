/** @jsx jsx */
import { Grid, Box, jsx } from 'theme-ui';

/**
 * Expects two children: the first one is the main content, the second one is the sidebar
 */
const SidebarLayout = ({ children, ...props }: React.PropsWithChildren<any>) => {
  return (
    <Grid
      gap={4}
      sx={theme => ({
        gridTemplateColumns: [
          'auto', // default to a stacked layout on small & medium screens
          'auto',
          'auto',
          `1fr ${theme.sizes.sidebar}px` // use columns for larger screens
        ],
        '& > *': {
          minWidth: 0
        }
      })}
      {...props}
    >
      {children}
    </Grid>
  );
};

export const StickyColumn = ({ children, ...props }: React.PropsWithChildren<{ isSticky?: boolean[] }>) => {
  return (
    <Box sx={{ position: [null, null, null, 'sticky'], top: 0, height: 'min-content' }} {...props}>
      <Box sx={{ maxHeight: [null, null, null, '100vh'], overflowY: 'auto' }}>{children}</Box>
    </Box>
  );
};

export default SidebarLayout;
