/** @jsx jsx */
import { Heading, Box, jsx, Flex, NavLink, Button } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import ErrorPage from 'next/error';
import { Icon } from '@makerdao/dai-ui-icons';

import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import Link from 'next/link';
import Head from 'next/head';
import { Delegate } from 'types/delegate';
import { DelegateDetail } from 'components/delegations';
import { getNetwork } from 'lib/maker';
import { useEffect, useState } from 'react';
import { fetchJson } from 'lib/utils';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';
import PageLoadingPlaceholder from 'components/PageLoadingPlaceholder';
import { useRouter } from 'next/router';

const DelegateCompareView = ({ delegate }: { delegate: Delegate }) => {
  const network = getNetwork();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });

  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegate Vote Compare</title>
      </Head>

      <SidebarLayout>
        <Stack gap={2}>
          <Flex sx={{ alignItems: 'center' }}>
            <Heading variant="microHeading" mr={3}>
              <Link scroll={false} href={{ pathname: '/delegates', query: { network } }}>
                <NavLink p={0}>
                  <Button variant="mutedOutline" onClick={() => trackButtonClick('backToDelegatePage')}>
                    <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                      <Icon name="chevron_left" size={2} mr={2} />
                      {bpi > 0 ? 'Back to all delegates' : 'Back'}
                    </Flex>
                  </Button>
                </NavLink>
              </Link>
            </Heading>
          </Flex>

          <Box>compare stuff here</Box>
        </Stack>
        <Stack gap={3}>
          <SystemStatsSidebar
            fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
          />
          <ResourceBox />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function DelegatesPage(): JSX.Element {
  const [delegate, setDelegate] = useState<Delegate>();
  const [error, setError] = useState<string>();
  const router = useRouter();
  const { address } = router.query;
  // fetch delegates at run-time if on any network other than the default
  useEffect(() => {
    if (address) {
      fetchJson(`/api/delegates/${address}?network=${getNetwork()}`).then(setDelegate).catch(setError);
    }
  }, [address]);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching delegate" />;
  }

  if (!delegate) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );
  }

  return <DelegateCompareView delegate={delegate} />;
}
