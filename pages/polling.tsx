/** @jsx jsx */
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, Heading, Checkbox, Label, Box, Flex, Input, jsx } from 'theme-ui';
import ErrorPage from 'next/error';

import { isDefaultNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import { isActivePoll } from '../lib/utils';
import PrimaryLayout from '../components/layouts/Primary';
import SidebarLayout from '../components/layouts/Sidebar';
import Stack from '../components/layouts/Stack';
import PollOverviewCard from '../components/polling/PollOverviewCard';
import Poll from '../types/poll';

type Props = {
  polls: Poll[];
};

const PollingOverview = ({ polls }: Props) => {
  const [dateFilter, setDateFilter] = useState<(Date | null)[]>([null, null]);
  const [numLoadedPolls, setNumLoadedPolls] = useState<number>(10);
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

  const filteredPolls = useMemo(
    () =>
      polls
        .filter(poll => {
          if (filterInactivePolls && !isActivePoll(poll)) return false;
          const [startDate, endDate] = dateFilter;
          if (startDate && new Date(poll.startDate).getTime() < startDate.getTime()) return false;
          if (endDate && new Date(poll.startDate).getTime() > endDate.getTime()) return false;
          return true;
        })
        .slice(0, numLoadedPolls),
    [polls, filterInactivePolls, dateFilter, numLoadedPolls]
  );

  const activePolls = filteredPolls.filter(poll => isActivePoll(poll));
  const historicalPolls = filteredPolls.filter(poll => !isActivePoll(poll));

  return (
    <PrimaryLayout shortenFooter={true}>
      <Stack gap={3}>
        <Heading as="h1">Polling Votes</Heading>
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

          <Flex sx={{ flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Label sx={{ width: 'auto', whiteSpace: 'nowrap', alignItems: 'center' }}>
              Show only polls starting after
              <Input
                sx={{ ml: 3, minWidth: 6 }}
                type="date"
                onChange={e => setDateFilter([new Date(e.target.value), dateFilter[1]])}
              />
            </Label>
            <Label sx={{ width: 'auto', whiteSpace: 'nowrap', alignItems: 'center' }}>
              Show only polls starting before
              <Input
                sx={{ ml: 3, minWidth: 6 }}
                type="date"
                onChange={e => setDateFilter([dateFilter[0], new Date(e.target.value)])}
              />
            </Label>
          </Flex>
        </Box>
        <SidebarLayout>
          <Box>
            <Stack>
              {activePolls.length > 0 && (
                <div>
                  <Heading mb={3} as="h3">
                    Active Polls
                  </Heading>
                  <Stack>
                    {activePolls.map(poll => (
                      <PollOverviewCard key={poll.multiHash} poll={poll} />
                    ))}
                  </Stack>
                </div>
              )}
              <div>
                <Heading mb={3} mt={4} as="h3">
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
