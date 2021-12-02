import { useEffect, useState, useRef, useMemo } from 'react';
import { Heading, Box, Flex, Button, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';
import { GetStaticProps } from 'next';
import shallow from 'zustand/shallow';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';

import { Poll, PollCategory } from 'modules/polling/types';
import { isDefaultNetwork, getNetwork } from 'lib/maker';
import { formatDateWithTime } from 'lib/datetime';
import { fetchJson } from 'lib/fetchJson';
import { isActivePoll } from 'modules/polling/helpers/utils';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import DateFilter from 'modules/polling/components/DateFilter';
import CategoryFilter from 'modules/polling/components/CategoryFilter';
import BallotBox from 'modules/polling/components/BallotBox';
import ResourceBox from 'modules/app/components/ResourceBox';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import useBallotStore from 'modules/polling/stores/ballotStore';
import useAccountsStore from 'modules/app/stores/accounts';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import MobileVoteSheet from 'modules/polling/components/MobileVoteSheet';
import BallotStatus from 'modules/polling/components/BallotStatus';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { PollsResponse } from 'modules/polling/types/pollsResponse';
import { filterPolls } from 'modules/polling/helpers/filterPolls';

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
    showPollActive,
    showPollEnded,
    setShowHistorical,
    resetPollFilters
  ] = useUiFiltersStore(
    state => [
      state.pollFilters.startDate,
      state.pollFilters.endDate,
      state.pollFilters.categoryFilter,
      state.pollFilters.showHistorical,
      state.pollFilters.showPollActive,
      state.pollFilters.showPollEnded,
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

  const filteredPolls = useMemo(() => {
    return filterPolls(polls, startDate, endDate, categoryFilter, showPollActive, showPollEnded);
  }, [polls, startDate, endDate, categoryFilter, showPollActive, showPollEnded]);

  const [activePolls, setActivePolls] = useState([]);
  const [historicalPolls, setHistoricalPolls] = useState([]);

  const groupedActivePolls = groupBy(activePolls, 'endDate');
  const sortedEndDatesActive = sortBy(Object.keys(groupedActivePolls), x => new Date(x));

  const groupedHistoricalPolls = groupBy(historicalPolls, 'endDate');
  const sortedEndDatesHistorical = sortBy(Object.keys(groupedHistoricalPolls), x => -new Date(x));

  useEffect(() => {
    const [active, historical] = partition(filteredPolls, isActivePoll);

    if (active.length === 0) {
      setShowHistorical(true);
    }

    setActivePolls(active);
    setHistoricalPolls(historical);
  }, [filteredPolls]);

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
  const voteDelegate = useAccountsStore(state => (account ? state.voteDelegate : null));
  const addressToCheck = voteDelegate ? voteDelegate.getVoteDelegateAddress() : account?.address;
  const { mutate: mutateAllUserVotes } = useAllUserVotes(addressToCheck);

  // revalidate user votes if connected address changes
  useEffect(() => {
    mutateAllUserVotes();
  }, [addressToCheck]);

  const [mobileVotingPoll, setMobileVotingPoll] = useState<Poll | null>();

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent
        title="Polling"
        description={`Lastest poll: ${polls[0].title}. Active Polls: ${activePolls.length}. Total Polls: ${polls.length}. .`}
      />

      {mobileVotingPoll && (
        <MobileVoteSheet
          account={account}
          ballotCount={ballotLength}
          poll={mobileVotingPoll}
          setPoll={setMobileVotingPoll}
          close={() => setMobileVotingPoll(null)}
        />
      )}
      <Stack gap={3}>
        {bpi <= 1 && account && <BallotStatus />}
        <Flex sx={{ alignItems: 'center', flexDirection: ['column', 'row'] }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Heading variant="microHeading" mr={3} sx={{ display: ['none', 'block'] }}>
              Filters
            </Heading>
            <CategoryFilter categories={categories} polls={polls} />
            <DateFilter sx={{ ml: 3 }} />
          </Flex>
          <Button variant={'outline'} sx={{ ml: 3, mt: [2, 0] }} onClick={resetPollFilters}>
            Clear filters
          </Button>
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
                              showVoting={true}
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
                              <PollOverviewCard
                                key={poll.multiHash}
                                poll={poll}
                                reviewPage={false}
                                showVoting={true}
                              />
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
            <ResourceBox type={'polling'} />
            <ResourceBox type={'general'} />
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
      fetchJson(`/api/polling/all-polls?network=${getNetwork()}`)
        .then((pollsResponse: PollsResponse) => {
          _setPolls(pollsResponse.polls);
          _setCategories(pollsResponse.categories);
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
  const pollsResponse = await getPolls();

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls: pollsResponse.polls,
      categories: pollsResponse.categories
    }
  };
};
