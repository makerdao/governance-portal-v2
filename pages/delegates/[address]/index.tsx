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
import { getPolls } from 'lib/api';
import { getCategories } from 'lib/polling/getCategories';
import { GetStaticPaths, GetStaticProps } from 'next';
import { fetchDelegates } from 'lib/delegates/fetchDelegates';

const DelegateView = ({ delegate: del, polls }: { delegate: Delegate }) => {
  const network = getNetwork();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });

  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);
  const delegate = del;

  const dvh = del.voteHistory.map(vh => {
    const myPoll = polls.find(poll => poll.pollId === vh.pollId);
    return { ...vh, title: myPoll.title, optionValue: myPoll.options[vh.optionId] };
  });

  delegate.voteHistory = dvh;

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegate Information</title>
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

          <Box>
            <DelegateDetail delegate={delegate} />
          </Box>
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

export default function DelegatesPage({ polls }): JSX.Element {
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

  return <DelegateView delegate={delegate} polls={polls} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const polls = await getPolls();
  const delegatesAPIResponse = await fetchDelegates();

  const paths = delegatesAPIResponse.delegates.map(p => `/delegates/${p.address}`);
  return {
    paths,
    fallback: true
  };
};

export const getStaticProps: GetStaticProps = async () => {
  // fetch polls at build-time if on the default network
  const polls = await getPolls();
  const categories = getCategories(polls);

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls,
      categories
    }
  };
};
