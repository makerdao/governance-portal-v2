/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { GetStaticProps } from 'next';
import { Heading, Box, Button, Text, Card, Alert } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ResourceBox from 'modules/app/components/ResourceBox';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';

export default function PollingPage(): JSX.Element {
  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="Polls" />

      <SidebarLayout>
        <Box>
          <Stack gap={4}>
            <Heading as="h1">Polls</Heading>

            <Alert variant="banner" sx={{ mb: 4 }}>
              <Text>
                Active governance has moved to Sky Ecosystem. This page now displays governance polls from
                both the legacy MakerDAO system and the current Sky governance system.
              </Text>
            </Alert>

            <Card variant="compact" sx={{ p: 4 }}>
              <Heading as="h2" sx={{ mb: 3 }}>
                Current Governance
              </Heading>
              <Text sx={{ mb: 3, color: 'textSecondary' }}>
                Active polls and voting are now handled through the Sky governance portal.
              </Text>
              <ExternalLink href="https://vote.sky.money/polling" title="Vote on Sky Governance">
                <Button variant="primary">View Active Polls on Sky</Button>
              </ExternalLink>
            </Card>

            <Card variant="compact" sx={{ p: 4 }}>
              <Heading as="h2" sx={{ mb: 3 }}>
                Legacy MakerDAO Polls
              </Heading>
              <Text sx={{ mb: 3, color: 'textSecondary' }}>
                View historical polls from the MakerDAO governance system (pre-Sky migration).
              </Text>
              <InternalLink href="/legacy-polling" title="View Legacy Polls">
                <Button variant="outline">View Legacy Polls</Button>
              </InternalLink>
            </Card>
          </Stack>
        </Box>

        <Stack gap={3}>
          <ErrorBoundary componentName="System Info">
            <SystemStatsSidebar
              fields={['chief contract', 'mkr in chief', 'savings rate', 'total dai', 'debt ceiling']}
            />
          </ErrorBoundary>
          <ResourceBox type={'polling'} />
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    revalidate: 60 * 30, // allow revalidation every half an hour in seconds
    props: {}
  };
};
