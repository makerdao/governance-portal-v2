/** @jsx jsx */
import { useEffect, useState, useRef, useMemo } from 'react';
import { Heading, Box, Flex, jsx, Button, IconButton, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';

import { isDefaultNetwork, getNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import { isActivePoll } from '../lib/utils';
import PrimaryLayout from '../components/layouts/Primary';
import SidebarLayout from '../components/layouts/Sidebar';
import Stack from '../components/layouts/Stack';
import PollOverviewCard from '../components/polling/PollOverviewCard';
import Poll from '../types/poll';
import DateFilter from '../components/polling/DateFilter';
import CategoryFilter from '../components/polling/CategoryFilter';
import BallotBox from '../components/polling/BallotBox';
import ResourceBox from '../components/polling/ResourceBox';
import useBallotStore from '../stores/ballot';
import useAccountsStore from '../stores/accounts';
import useBreakpoints from '../lib/useBreakpoints';

type Props = {
  polls: Poll[];
};

const PollingOverview = ({ polls }: Props) => {
  const [startDate, setStartDate] = useState<Date | ''>('');
  const [endDate, setEndDate] = useState<Date | ''>('');
  const [numHistoricalLoaded, setNumHistoricalLoaded] = useState(10);
  const [showHistoricalPolls, setShowHistoricalPolls] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<{ [category: string]: boolean }>(
    polls.map(poll => poll.category).reduce((acc, category) => ({ ...acc, [category]: true }), {})
  );
  const ballot = useBallotStore(state => state.ballot);
  const network = getNetwork();
  const loader = useRef<HTMLDivElement>(null);
  const bpi = useBreakpoints();

  useEffect(() => {
    if (location.href.includes('pollFilter=active')) {
      // setFilterInactivePolls(true);
    }
  }, []);

  const filteredPolls = useMemo(() => {
    const start = startDate && new Date(startDate);
    const end = endDate && new Date(endDate);
    return polls.filter(poll => {
      if (start && new Date(poll.startDate).getTime() < start.getTime()) return false;
      if (end && new Date(poll.startDate).getTime() > end.getTime()) return false;
      return categoryFilter[poll.category];
    });
  }, [polls, startDate, endDate, categoryFilter]);

  const activePolls = filteredPolls.filter(poll => isActivePoll(poll));
  const historicalPolls = filteredPolls.filter(poll => !isActivePoll(poll));

  const loadMore = entries => {
    const target = entries.pop();
    if (target.isIntersecting) {
      setNumHistoricalLoaded(
        numHistoricalLoaded < historicalPolls.length ? numHistoricalLoaded + 5 : numHistoricalLoaded
      );
    }
  };

  useEffect(() => {
    let observer;
    if (loader?.current) {
      // Create observer
      observer = new IntersectionObserver(loadMore, {
        root: null,
        rootMargin: '600px'
      });
      // observe the loader
      observer.observe(loader.current);
    }
    return () => {
      if (observer) {
        // clean up
        return observer.unobserve(loader.current);
      }
    };
  }, [loader, loadMore]);

  useEffect(() => {
    setNumHistoricalLoaded(10); // reset inifite scroll if a new filter is applied
  }, [filteredPolls]);

  const account = useAccountsStore(state => state.currentAccount);

  return (
    <PrimaryLayout shortenFooter={true}>
      <Stack gap={3}>
        <Flex sx={{ alignItems: 'center', display: activePolls.length ? null : 'none' }}>
          <Heading as="h1" mr={3}>
            Filters
          </Heading>
          <CategoryFilter {...{ categoryFilter, setCategoryFilter }} />
          <DateFilter {...{ startDate, endDate, setStartDate, setEndDate }} sx={{ ml: 3 }} />
        </Flex>
        <SidebarLayout>
          <Box>
            <Stack>
              <div>
                <Heading mb={3} as="h4">
                  Active Polls
                </Heading>
                <Text variant="caps" color="onSurface" mb={2}>
                  {`${activePolls.length} Polls - Posted ${`date time?`}`}
                </Text>
                <Stack sx={{ mb: 4, display: activePolls.length ? null : 'none' }}>
                  {activePolls.map(poll => (
                    <PollOverviewCard key={poll.multiHash} poll={poll} />
                  ))}
                </Stack>
              </div>
              {showHistoricalPolls ? (
                <div>
                  <Heading mb={3} as="h4">
                    Historical Polls
                    <IconButton onClick={() => setShowHistoricalPolls(false)}>
                      <Icon name="chevron_down" />
                    </IconButton>
                  </Heading>
                  <Stack>
                    {historicalPolls.slice(0, numHistoricalLoaded).map(poll => (
                      <PollOverviewCard key={poll.multiHash} poll={poll} />
                    ))}
                  </Stack>
                  <div ref={loader} />
                </div>
              ) : (
                <Button onClick={() => setShowHistoricalPolls(true)} variant="outline">
                  See all ended polls ({historicalPolls.length})
                </Button>
              )}
            </Stack>
          </Box>
          <Stack gap={3}>
            {account && bpi > 0 && <BallotBox activePolls={activePolls} ballot={ballot} network={network} />}
            <ResourceBox />
          </Stack>
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function PollingOverviewPage({ polls: prefetchedPolls }: Props) {
  const [_polls, _setPolls] = useState<Poll[]>();
  const [error, setError] = useState<string>();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls()
        .then(_setPolls)
        .catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && !_polls)
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return <PollingOverview polls={isDefaultNetwork() ? prefetchedPolls : (_polls as Poll[])} />;
}

export async function getStaticProps() {
  // fetch polls at build-time if on the default network
  const polls = await getPolls();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls
    }
  };
}
