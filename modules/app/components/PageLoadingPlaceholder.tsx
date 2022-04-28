import Skeleton from 'modules/app/components/SkeletonThemed';
import { Box } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';

type Props = {
  sidebar?: boolean;
};

export default function PageLoadingPlaceholder({ sidebar = true }: Props): React.ReactElement {
  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      <Box mt={3} mb={4}>
        <Skeleton width="50%" height={'70px'} />
      </Box>
      {sidebar && (
        <SidebarLayout sx={{ maxWidth: 'dashboard' }}>
          <Box>
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
          <Box>
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
        </SidebarLayout>
      )}
    </PrimaryLayout>
  );
}
