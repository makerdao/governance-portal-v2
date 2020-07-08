/** @jsx jsx */
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, Heading, Checkbox, Label, Box, Flex, jsx } from 'theme-ui';
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

type Props = {
  polls: Poll[];
};

const PollingOverview = ({ polls }: Props) => {
  const [startDate, setStartDate] = useState<Date | ''>('');
  const [endDate, setEndDate] = useState<Date | ''>('');
  const [numLoadedPolls, setNumLoadedPolls] = useState(10);
  const [filterInactivePolls, setFilterInactivePolls] = useState(false);
  const loader = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.href.includes('pollFilter=active')) {
      setFilterInactivePolls(true);
    }
  }, []);

  const loadMore = useCallback(
    entries => {
      const target = entries.pop();
      if (target.isIntersecting) {
        setNumLoadedPolls(numLoadedPolls < polls.length ? numLoadedPolls + 5 : numLoadedPolls);
      }
    },
    [numLoadedPolls, setNumLoadedPolls]
  );

  useEffect(() => {
    if (loader?.current) {
      // Create observer
      const observer = new IntersectionObserver(loadMore, {
        root: null,
        rootMargin: '600px'
      });
      // observe the loader
      observer.observe(loader.current);
      // clean up
      return () => observer.unobserve(loader.current as HTMLDivElement);
    }
  }, [loader, loadMore]);

  const filteredPolls = useMemo(() => {
    const start = startDate && new Date(startDate);
    const end = endDate && new Date(endDate);
    return polls
      .filter(poll => {
        if (filterInactivePolls && !isActivePoll(poll)) return false;
        if (start && new Date(poll.startDate).getTime() < start.getTime()) return false;
        if (end && new Date(poll.startDate).getTime() > end.getTime()) return false;
        return true;
      })
      .slice(0, numLoadedPolls);
  }, [polls, filterInactivePolls, startDate, endDate, numLoadedPolls]);

  const activePolls = filteredPolls.filter(poll => isActivePoll(poll));
  const historicalPolls = filteredPolls.filter(poll => !isActivePoll(poll));

  return (
    <PrimaryLayout shortenFooter={true}>
      <Stack gap={3}>
        <Flex sx={{ alignItems: 'center' }}>
          <Heading as="h1" mr={3}>
            Polling Votes
          </Heading>
          <DateFilter {...{ startDate, endDate, setStartDate, setEndDate }} />
        </Flex>
        <Box sx={theme => ({ mr: [null, null, theme.sizes.sidebar], pr: [null, 4] })}>
          <Box>
            <Label>
              <Checkbox
                checked={filterInactivePolls}
                onChange={() => setFilterInactivePolls(b => !b)}
                sx={{ mr: 3 }}
              />
              Show only active polls
            </Label>
          </Box>
        </Box>
        <SidebarLayout>
          <Box>
            <Stack>
              {activePolls.length > 0 && (
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
              )}
              <div>
                <Heading mb={3} as="h4">
                  Historical Polls
                </Heading>
                <Stack>
                  {historicalPolls.map(poll => (
                    <PollOverviewCard key={poll.multiHash} poll={poll} />
                  ))}
                </Stack>
              </div>
            </Stack>
            <div ref={loader} />
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
