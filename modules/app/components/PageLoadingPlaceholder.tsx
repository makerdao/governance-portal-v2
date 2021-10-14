/** @jsx jsx */
import Skeleton from 'modules/app/components/SkeletonThemed';
import { Box, jsx } from 'theme-ui';

export default function PageLoadingPlaceholder(): React.ReactElement {
  return (
    <Box>
      <p>Loading…</p>

      <Box mb={3}>
        <Skeleton width="100%" height={'100px'} />
      </Box>
      <Box mb={3}>
        <Skeleton width="100%" height={'100px'} />
      </Box>
      <Box mb={3}>
        <Skeleton width="100%" height={'100px'} />
      </Box>
    </Box>
  );
}
