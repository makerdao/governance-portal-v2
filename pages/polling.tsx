/** @jsx jsx */
import { useEffect, useState, useRef, useMemo } from 'react';
import { Heading, Box, Flex, jsx, Button, IconButton, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';

import { isDefaultNetwork, getNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import { isActivePoll, formatDateWithTime } from '../lib/utils';
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
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import sortBy from 'lodash/sortBy';
import { useRouter } from 'next/router';
import MobileVoteSheet from '../components/polling/MobileVoteSheet';

type Props = {
  polls: Poll[];
};

const PollingOverview = ({ polls }: Props) => {
  const [startDate, setStartDate] = useState<Date | ''>('');
  const [endDate, setEndDate] = useState<Date | ''>('');
  const [numHistoricalGroupingsLoaded, setNumHistoricalGroupingsLoaded] = useState(3);
  const [showHistoricalPolls, setShowHistoricalPolls] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<{ [category: string]: boolean }>(
    polls.map(poll => poll.category).reduce((acc, category) => ({ ...acc, [category]: true }), {})
  );
  const ballot = useBallotStore(state => state.ballot);
  const ballotLength = Object.keys(ballot).length;
  const network = getNetwork();
  const loader = useRef<HTMLDivElement>(null);
  const bpi = useBreakpoints();
  const router = useRouter();

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

  const [activePolls, historicalPolls] = partition(filteredPolls, isActivePoll);

  const groupedActivePolls = groupBy(activePolls, 'startDate');
  const sortedStartDatesActive = sortBy(Object.keys(groupedActivePolls), x => -new Date(x));

  const groupedHistoricalPolls = groupBy(historicalPolls, 'startDate');
  const sortedStartDatesHistorical = sortBy(Object.keys(groupedHistoricalPolls), x => -new Date(x));

  const loadMore = entries => {
    const target = entries.pop();
    if (target.isIntersecting) {
      setNumHistoricalGroupingsLoaded(
        numHistoricalGroupingsLoaded < sortedStartDatesHistorical.length
          ? numHistoricalGroupingsLoaded + 3
          : numHistoricalGroupingsLoaded
      );
    }
  };

  useEffect(() => {
    let observer;
    if (loader?.current) {
      observer = new IntersectionObserver(loadMore, { root: null, rootMargin: '600px' });
      observer.observe(loader.current);
    }
    return () => {
      if (loader?.current) {
        observer?.unobserve(loader.current);
      }
    };
  }, [loader, loadMore]);

  useEffect(() => {
    setNumHistoricalGroupingsLoaded(3); // reset inifite scroll if a new filter is applied
  }, [filteredPolls]);

  const account = useAccountsStore(state => state.currentAccount);

  const [mobileVotingPoll, setMobileVotingPoll] = useState<Poll | null>();

  return (
    <PrimaryLayout shortenFooter={true}>
      {mobileVotingPoll && (
        <MobileVoteSheet
          ballotCount={ballotLength}
          activePolls={activePolls}
          poll={mobileVotingPoll}
          setPoll={setMobileVotingPoll}
          close={() => setMobileVotingPoll(null)}
        />
      )}
      <Stack gap={3}>
        {bpi === 0 && account && (
          <Button
            variant={ballotLength ? 'primary' : 'outline'}
            sx={{
              borderRadius: 'round',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => ballotLength && router.push({ pathname: '/polling/review', query: network })}
          >
            <Icon name="ballot" size={3} mr={2} />
            Your Ballot: {ballotLength} vote{ballotLength === 1 ? '' : 's'}
          </Button>
        )}
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
                {sortedStartDatesActive.map(date => (
                  <div key={date}>
                    <Text variant="caps" color="onSurface" mb={2}>
                      {groupedActivePolls[date].length} Poll{groupedActivePolls[date].length === 1 ? '' : 's'}{' '}
                      - Posted {formatDateWithTime(date)}
                    </Text>
                    <Stack sx={{ mb: 4, display: activePolls.length ? null : 'none' }}>
                      {groupedActivePolls[date].map(poll => (
                        <PollOverviewCard
                          key={poll.multiHash}
                          poll={poll}
                          startMobileVoting={() => setMobileVotingPoll(poll)}
                          reviewing={false}
                          sending={null}
                        />
                      ))}
                    </Stack>
                  </div>
                ))}
              </div>
              {showHistoricalPolls ? (
                <div>
                  <Heading mb={3} as="h4">
                    Historical Polls
                    <IconButton onClick={() => setShowHistoricalPolls(false)}>
                      <Icon name="chevron_down" />
                    </IconButton>
                  </Heading>
                  {sortedStartDatesHistorical.slice(0, numHistoricalGroupingsLoaded).map(date => (
                    <div key={date}>
                      <Text variant="caps" color="onSurface" mb={2}>
                        {groupedHistoricalPolls[date].length} Poll
                        {groupedHistoricalPolls[date].length === 1 ? '' : 's'} - Posted{' '}
                        {formatDateWithTime(date)}
                      </Text>
                      <Stack sx={{ mb: 4 }}>
                        {groupedHistoricalPolls[date].map(poll => (
                          <PollOverviewCard
                            key={poll.multiHash}
                            poll={poll}
                            reviewing={false}
                            sending={null}
                          />
                        ))}
                      </Stack>
                    </div>
                  ))}
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

export default function PollingOverviewPage({ polls: prefetchedPolls }: Props): JSX.Element {
  const [_polls, _setPolls] = useState<Poll[]>();
  const [error, setError] = useState<string>();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls().then(_setPolls).catch(setError);
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

type StaticProps = {
  unstable_revalidate: number;
  props: {
    polls: Poll[];
  };
};

export async function getStaticProps(): StaticProps {
  // fetch polls at build-time if on the default network
  const polls = await getPolls();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls
    }
  };
}
