/** @jsx jsx */
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, Heading, Box, Flex, jsx, Button, Link, IconButton } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';

import { isDefaultNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import { isActivePoll } from '../lib/utils';
import PrimaryLayout from '../components/layouts/Primary';
import SidebarLayout from '../components/layouts/Sidebar';
import Stack from '../components/layouts/Stack';
import PollOverviewCard from '../components/polling/PollOverviewCard';
import Poll from '../types/poll';
import DateFilter from '../components/polling/DateFilter';
import CategoryFilter from '../components/polling/CategoryFilter';

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
  const loader = useRef<HTMLDivElement>(null);

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
      if (observer && loader?.current) {
        // clean up
        return observer.unobserve(loader.current as HTMLDivElement);
      }
    };
  }, [loader, loadMore]);

  useEffect(() => {
    setNumHistoricalLoaded(10); // reset inifite scroll if a new filter is applied
  }, [filteredPolls]);

  return (
    <PrimaryLayout shortenFooter={true}>
      <Stack gap={3}>
        <Flex sx={{ alignItems: 'center' }}>
          <Heading as="h1" mr={3}>
            Polling Votes
          </Heading>
          <CategoryFilter {...{ categoryFilter, setCategoryFilter }} />
          <DateFilter {...{ startDate, endDate, setStartDate, setEndDate }} sx={{ ml: 3 }} />
        </Flex>
        <SidebarLayout>
          <Box>
            <Stack>
              <div>
                <Heading mb={3} as="h3">
                  Active Polls
                </Heading>
                <Stack sx={{ mb: 4 }}>
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
          <Stack>
            <Card variant="compact">Card 1</Card>
            <Card variant="compact">Card 2</Card>
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
