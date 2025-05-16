/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import Skeleton from 'modules/app/components/SkeletonThemed';
import { Box, Flex } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';

type Props = {
  sidebar?: boolean;
};

export default function PageLoadingPlaceholder({ sidebar = true }: Props): React.ReactElement {
  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      {/* Hero section */}
      <Flex sx={{ flexDirection: ['column', 'column', 'row'], justifyContent: 'space-between', mb: 5 }}>
        <Box sx={{ p: 3, width: ['100%', '100%', '50%'] }}>
          <Box mb={3}>
            <Skeleton width="70%" height="80px" />
          </Box>
          <Box mb={3}>
            <Skeleton width="60%" height="80px" />
          </Box>
          <Box mb={3}>
            <Skeleton width="80%" height="40px" />
          </Box>
          <Skeleton width="200px" height="40px" />
        </Box>
        <Box sx={{ py: 3, px: [1, 3], width: ['100%', '100%', '50%'] }}>
          <Flex sx={{ justifyContent: 'space-between', mb: 3 }}>
            <Skeleton width="150px" height="30px" />
            <Skeleton width="100px" height="30px" />
          </Flex>
          <Skeleton width="100%" height="200px" />
        </Box>
      </Flex>

      {/* Stats section */}
      <Box mb={5}>
        <Skeleton width="100%" height="150px" />
      </Box>

      {/* Polls section */}
      <Box mb={5}>
        <Skeleton width="100%" height="300px" />
      </Box>

      {/* Delegates section */}
      <Box mb={5}>
        <Skeleton width="100%" height="400px" />
      </Box>

      {/* Resources section */}
      <Box mb={5}>
        <Skeleton width="100%" height="500px" />
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
