/** @jsx jsx */
import { useEffect, useState, useRef, useMemo } from 'react';
import { Heading, Box, Flex, jsx, Button, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';
import { GetStaticProps } from 'next';
import shallow from 'zustand/shallow';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';

import { Poll, PollCategory } from 'modules/polls/types';
import { isDefaultNetwork, getNetwork } from 'lib/maker';
import { formatDateWithTime } from 'lib/utils';
import { isActivePoll } from 'modules/polls/helpers/utils';
import { getCategories } from 'modules/polls/helpers/getCategories';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import PollOverviewCard from 'components/polling/PollOverviewCard';
import DateFilter from 'components/polling/DateFilter';
import CategoryFilter from 'components/polling/CategoryFilter';
import BallotBox from 'components/polling/BallotBox';
import ResourceBox from 'components/ResourceBox';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import useBallotStore from 'stores/ballot';
import useAccountsStore from 'stores/accounts';
import useUiFiltersStore from 'stores/uiFilters';
import MobileVoteSheet from 'components/polling/MobileVoteSheet';
import BallotStatus from 'components/polling/BallotStatus';
import Head from 'next/head';
import PageLoadingPlaceholder from 'components/PageLoadingPlaceholder';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';
import { getPolls } from 'modules/polls/api/fetchPolls';

type Props = {
  polls: Poll[];
  categories: PollCategory[];
};

const PollingOverview = ({ polls, categories }: Props) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);
  const [
    startDate,
    endDate,
    categoryFilter,
    showHistorical,
    setShowHistorical,
    resetPollFilters
  ] = useUiFiltersStore(
    state => [
      state.pollFilters.startDate,
      state.pollFilters.endDate,
      state.pollFilters.categoryFilter,
      state.pollFilters.showHistorical,
      state.setShowHistorical,
      state.resetPollFilters
    ],
    shallow
  );

  const [numHistoricalGroupingsLoaded, setNumHistoricalGroupingsLoaded] = useState(3);
  const ballot = useBallotStore(state => state.ballot);
  const ballotLength = Object.keys(ballot).length;
  const network = getNetwork();
  const loader = useRef<HTMLDivElement>(null);
  const bpi = useBreakpointIndex();

  const noCategoriesSelected = categoryFilter === null || Object.values(categoryFilter).every(c => !c);
  const start = startDate && new Date(startDate);
  const end = endDate && new Date(endDate);

  const filteredPolls = useMemo(() => {
    return polls.filter(poll => {
      // check date filters first
      if (start && new Date(poll.startDate).getTime() < start.getTime()) return false;
      if (end && new Date(poll.startDate).getTime() > end.getTime()) return false;

      // if no category filters selected, return all, otherwise, check if poll contains category
      return noCategoriesSelected || poll.categories.some(c => categoryFilter && categoryFilter[c]);
    });
  }, [polls, startDate, endDate, categoryFilter]);

  const [activePolls, historicalPolls] = partition(filteredPolls, isActivePoll);

  const groupedActivePolls = groupBy(activePolls, 'endDate');
  const sortedEndDatesActive = sortBy(Object.keys(groupedActivePolls), x => new Date(x));

  const groupedHistoricalPolls = groupBy(historicalPolls, 'endDate');
  const sortedEndDatesHistorical = sortBy(Object.keys(groupedHistoricalPolls), x => -new Date(x));

  useEffect(() => {
    if (activePolls.length === 0) {
      setShowHistorical(true);
    }
  }, []);

  const loadMore = entries => {
    const target = entries.pop();
    if (target.isIntersecting) {
      setNumHistoricalGroupingsLoaded(
        numHistoricalGroupingsLoaded < sortedEndDatesHistorical.length
          ? numHistoricalGroupingsLoaded + 2
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
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Polling</title>
      </Head>
      {mobileVotingPoll && (
        <MobileVoteSheet
          account={account}
          ballotCount={ballotLength}
          activePolls={activePolls}
          poll={mobileVotingPoll}
          setPoll={setMobileVotingPoll}
          close={() => setMobileVotingPoll(null)}
        />
      )}
      <Stack gap={3}>
        {bpi <= 1 && account && <BallotStatus />}
        <Flex sx={{ alignItems: 'center' }}>
          <Heading variant="microHeading" mr={3}>
            Filters
          </Heading>
          <CategoryFilter categories={categories} />
          <DateFilter sx={{ ml: 3 }} />
        </Flex>
        <SidebarLayout>
          <Box>
            {filteredPolls.length > 0 ? (
              <Stack>
                <div>
                  <Heading
                    mb={3}
                    mt={4}
                    as="h4"
                    sx={{ display: sortedEndDatesActive.length > 0 ? undefined : 'none' }}
                  >
                    Active Polls
                  </Heading>
                  <Stack>
                    {sortedEndDatesActive.map(date => (
                      <div key={date}>
                        <Text variant="caps" color="textSecondary" mb={2}>
                          {groupedActivePolls[date].length} Poll
                          {groupedActivePolls[date].length === 1 ? '' : 's'} - Ending{' '}
                          {formatDateWithTime(date)}
                        </Text>
                        <Stack sx={{ mb: 0, display: activePolls.length ? undefined : 'none' }}>
                          {groupedActivePolls[date].map(poll => (
                            <PollOverviewCard
                              key={poll.multiHash}
                              poll={poll}
                              startMobileVoting={() => setMobileVotingPoll(poll)}
                              reviewPage={false}
                            />
                          ))}
                        </Stack>
                      </div>
                    ))}
                  </Stack>
                </div>
                {showHistorical ? (
                  <div>
                    <Heading mb={3} as="h4" sx={{ display: historicalPolls.length > 0 ? undefined : 'none' }}>
                      <Flex sx={{ justifyContent: 'space-between' }}>
                        Ended Polls
                        <Button
                          onClick={() => {
                            trackButtonClick('hideHistoricalPolls');
                            setShowHistorical(false);
                          }}
                          variant="mutedOutline"
                        >
                          Hide ended polls
                        </Button>
                      </Flex>
                    </Heading>
                    <Stack>
                      {sortedEndDatesHistorical.slice(0, numHistoricalGroupingsLoaded).map(date => (
                        <div key={date}>
                          <Text variant="caps" color="textSecondary" mb={2}>
                            {groupedHistoricalPolls[date].length} Poll
                            {groupedHistoricalPolls[date].length === 1 ? '' : 's'} - Ended{' '}
                            {formatDateWithTime(date)}
                          </Text>
                          <Stack sx={{ mb: 4 }}>
                            {groupedHistoricalPolls[date].map(poll => (
                              <PollOverviewCard key={poll.multiHash} poll={poll} reviewPage={false} />
                            ))}
                          </Stack>
                        </div>
                      ))}
                    </Stack>
                    <div ref={loader} />
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      trackButtonClick('showHistoricalPolls');
                      setShowHistorical(true);
                    }}
                    variant="outline"
                    sx={{ py: 3, display: historicalPolls.length > 0 ? undefined : 'none' }}
                  >
                    View ended polls ({historicalPolls.length})
                  </Button>
                )}
              </Stack>
            ) : (
              <Flex sx={{ flexDirection: 'column', alignItems: 'center', pt: [5, 5, 5, 6] }}>
                <Flex
                  sx={{
                    borderRadius: '50%',
                    backgroundColor: 'muted',
                    p: 2,
                    width: '111px',
                    height: '111px',
                    alignItems: 'center'
                  }}
                >
                  <Box m={'auto'}>
                    <Icon name="magnifying_glass" sx={{ color: 'background', size: 4 }} />
                  </Box>
                </Flex>
                <Text variant={'microHeading'} sx={{ color: 'onSecondary', mt: 3 }}>
                  No polls found
                </Text>
                <Button
                  variant={'textual'}
                  sx={{ color: 'primary', textDecoration: 'underline', mt: 2, fontSize: 3 }}
                  onClick={resetPollFilters}
                >
                  Clear filters
                </Button>
              </Flex>
            )}
          </Box>
          <Stack gap={3}>
            {account && bpi > 0 && (
              <BallotBox polls={polls} activePolls={activePolls} ballot={ballot} network={network} />
            )}
            <SystemStatsSidebar
              fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
            />
            <ResourceBox />
          </Stack>
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function PollingOverviewPage({
  polls: prefetchedPolls,
  categories: prefetchedCategories
}: Props): JSX.Element {
  const [_polls, _setPolls] = useState<Poll[]>();
  const [_categories, _setCategories] = useState<PollCategory[]>();
  const [error, setError] = useState<string>();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls()
        .then(polls => {
          _setPolls(polls);
          _setCategories(getCategories(polls));
        })
        .catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && (!_polls || !_categories))
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );

  return (
    <PollingOverview
      polls={isDefaultNetwork() ? prefetchedPolls : (_polls as Poll[])}
      categories={isDefaultNetwork() ? prefetchedCategories : (_categories as PollCategory[])}
    />
  );
}

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
