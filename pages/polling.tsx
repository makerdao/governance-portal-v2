/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useEffect, useState, useRef, useMemo } from 'react';
import { Heading, Box, Flex, Button, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'modules/app/components/ErrorPage';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import shallow from 'zustand/shallow';
import sortBy from 'lodash/sortBy';
import useSWR, { useSWRConfig } from 'swr';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import { Poll } from 'modules/polling/types';
import { formatDateWithTime } from 'lib/datetime';
import { isActivePoll } from 'modules/polling/helpers/utils';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import { SearchBar } from 'modules/app/components/filters/SearchBar';
import { CategoryFilter } from 'modules/polling/components/filters/CategoryFilter';
import { StatusFilter } from 'modules/polling/components/filters/StatusFilter';
import { PollTypeFilter } from 'modules/polling/components/filters/PollTypeFilter';
import { DateFilter } from 'modules/polling/components/filters/DateFilter';
import BallotBox from 'modules/polling/components/BallotBox';
import ResourceBox from 'modules/app/components/ResourceBox';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import useUiFiltersStore, { PollsSortEnum } from 'modules/app/stores/uiFilters';
import BallotStatus from 'modules/polling/components/BallotStatus';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { filterPolls } from 'modules/polling/helpers/filterPolls';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { useAccount } from 'modules/app/hooks/useAccount';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { useIntersectionObserver } from 'modules/app/hooks/useIntersectionObserver';
import { fetchPollingPageData, PollingPageData } from 'modules/polling/api/fetchPollingPageData';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import PollsSort from 'modules/polling/components/filters/PollsSort';
import usePollsStore from 'modules/polling/stores/polls';

const getSortCriteria = (sort: PollsSortEnum | null) => {
  if (!sort) sort = PollsSortEnum.endDateAsc;
  const sortCriteria = {
    endDateAsc: {
      active: { sortFn: x => new Date(x), groupBy: 'endDate', verb: 'ending' },
      historical: { sortFn: x => -new Date(x), groupBy: 'endDate', verb: 'ended' }
    },
    endDateDesc: {
      active: { sortFn: x => -new Date(x), groupBy: 'endDate', verb: 'ending' },
      historical: { sortFn: x => new Date(x), groupBy: 'endDate', verb: 'ended' }
    },
    startDateAsc: {
      active: { sortFn: x => new Date(x), groupBy: 'startDate', verb: 'posted' },
      historical: { sortFn: x => new Date(x), groupBy: 'startDate', verb: 'posted' }
    },
    startDateDesc: {
      active: { sortFn: x => -new Date(x), groupBy: 'startDate', verb: 'posted' },
      historical: { sortFn: x => -new Date(x), groupBy: 'startDate', verb: 'posted' }
    }
  };

  return {
    activeVerb: sortCriteria[sort].active.verb,
    historicalVerb: sortCriteria[sort].historical.verb,
    activeGroupBy: sortCriteria[sort].active.groupBy,
    historicalGroupBy: sortCriteria[sort].historical.groupBy,
    activeSortFn: sortCriteria[sort].active.sortFn,
    historicalSortFn: sortCriteria[sort].historical.sortFn
  };
};

const PollingOverview = ({ polls, tags }: PollingPageData) => {
  const [pollFilters, setCategoryFilter, resetPollFilters, sort, title, setTitle] = useUiFiltersStore(
    state => [
      state.pollFilters,
      state.setCategoryFilter,
      state.resetPollFilters,
      state.pollsSortBy,
      state.pollFilters.title,
      state.setTitle
    ],
    shallow
  );
  const setFilteredPolls = usePollsStore(state => state.setFilteredPolls);
  const router = useRouter();

  useEffect(() => {
    if (router.query.category) {
      const category = router.query.category as string;
      setCategoryFilter({ [category]: true });
    }
  }, [router]);

  const [numHistoricalGroupingsLoaded, setNumHistoricalGroupingsLoaded] = useState(3);
  const loader = useRef<HTMLDivElement>(null);
  const bpi = useBreakpointIndex();
  const { network } = useWeb3();

  const filteredPolls = useMemo(() => {
    return filterPolls({
      polls,
      pollFilters
    });
  }, [polls, pollFilters]);

  useEffect(() => {
    setFilteredPolls(filteredPolls);
  }, [filteredPolls]);

  const { activeGroupBy, historicalGroupBy, activeSortFn, historicalSortFn, activeVerb, historicalVerb } =
    getSortCriteria(sort);

  const [activePolls, setActivePolls] = useState([]);
  const [historicalPolls, setHistoricalPolls] = useState([]);
  const [showHistorical, setShowHistorical] = useState(false);

  // only for mobile
  const [showFilters, setShowFilters] = useState(false);

  const groupedActivePolls = groupBy(activePolls, activeGroupBy);
  const sortedEndDatesActive = sortBy(Object.keys(groupedActivePolls), activeSortFn);

  const groupedHistoricalPolls = groupBy(historicalPolls, historicalGroupBy);
  const sortedEndDatesHistorical = sortBy(Object.keys(groupedHistoricalPolls), historicalSortFn);

  useEffect(() => {
    const [active, historical] = partition(filteredPolls, isActivePoll);

    if (active.length === 0) {
      setShowHistorical(true);
    }

    setActivePolls(active);
    setHistoricalPolls(historical);
  }, [filteredPolls]);

  const loadMore = () => {
    setNumHistoricalGroupingsLoaded(
      numHistoricalGroupingsLoaded < sortedEndDatesHistorical.length
        ? numHistoricalGroupingsLoaded + 2
        : numHistoricalGroupingsLoaded
    );
  };

  // Load more on scroll
  useIntersectionObserver(loader, loadMore);

  useEffect(() => {
    setNumHistoricalGroupingsLoaded(3); // reset inifite scroll if a new filter is applied
  }, [filteredPolls]);

  const { account, votingAccount } = useAccount();
  const { mutate: mutateAllUserVotes } = useAllUserVotes(votingAccount);

  // revalidate user votes if connected address changes
  useEffect(() => {
    mutateAllUserVotes();
  }, [votingAccount]);

  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent
        title="Polling"
        description={`${polls.length > 0 ? `Lastest poll: ${polls[0].title}. ` : ''}Active Polls: ${
          activePolls.length
        }. Total Polls: ${polls.length}. .`}
      />

      <Stack gap={3}>
        <Flex sx={{ justifyContent: ['center', 'flex-start'], alignItems: 'center', flexWrap: 'wrap' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Button
              variant="textual"
              sx={{ display: ['block', 'none'], color: 'onSecondary' }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Text sx={{ mr: 1 }}>{showFilters ? 'Hide poll filters' : 'Show poll filters'}</Text>
              <Icon name={showFilters ? 'chevron_down' : 'chevron_right'} size={2} />
            </Button>
          </Flex>
          {(showFilters || bpi > 0) && (
            <Flex sx={{ flexDirection: ['column', 'column', 'column', 'row'] }}>
              <Flex
                sx={{
                  justifyContent: ['center', 'center', 'center', 'flex-start'],
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <SearchBar sx={{ m: 2 }} onChange={setTitle} value={title} placeholder="Search poll titles" />
                <PollsSort />
                <CategoryFilter tags={tags} polls={polls} sx={{ m: 2 }} />
                <StatusFilter polls={polls} sx={{ m: 2 }} />
                <PollTypeFilter polls={polls} sx={{ m: 2 }} />
                <DateFilter sx={{ m: 2 }} />
              </Flex>
              <Button
                variant={'outline'}
                sx={{
                  m: 2,
                  color: 'textSecondary',
                  border: 'none'
                }}
                onClick={resetPollFilters}
              >
                Reset filters
              </Button>
            </Flex>
          )}
        </Flex>
        <SidebarLayout>
          <Box>
            {filteredPolls.length > 0 ? (
              <Stack>
                <div>
                  <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', my: 3 }}>
                    <Heading as="h4" sx={{ display: sortedEndDatesActive.length > 0 ? undefined : 'none' }}>
                      Active Polls
                    </Heading>
                    {bpi <= 2 && account && <BallotStatus />}
                  </Flex>
                  <Stack>
                    {sortedEndDatesActive.map(date => (
                      <div key={date}>
                        <Text as="p" variant="caps" color="textSecondary" mb={2}>
                          {`${groupedActivePolls[date].length} Poll${
                            groupedActivePolls[date].length === 1 ? '' : 's'
                          } - ${activeVerb} ${formatDateWithTime(date)}`}
                        </Text>
                        <Box sx={{ mb: 0, display: activePolls.length ? undefined : 'none' }}>
                          {groupedActivePolls[date].map((poll: Poll) => (
                            <Box key={poll.slug} sx={{ mb: 4 }}>
                              <PollOverviewCard poll={poll} showVoting={!!account} reviewPage={false} />
                            </Box>
                          ))}
                        </Box>
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
                          <Text as="p" variant="caps" color="textSecondary" mb={2}>
                            {`${groupedHistoricalPolls[date].length} Poll${
                              groupedHistoricalPolls[date].length === 1 ? '' : 's'
                            } - ${historicalVerb} ${formatDateWithTime(date)}`}
                          </Text>
                          <Box>
                            {groupedHistoricalPolls[date].map((poll: Poll) => (
                              <Box key={poll.slug} sx={{ mb: 4 }}>
                                <PollOverviewCard poll={poll} reviewPage={false} showVoting={false} />
                              </Box>
                            ))}
                          </Box>
                        </div>
                      ))}
                    </Stack>
                    <div ref={loader} />
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setShowHistorical(true);
                    }}
                    variant="outline"
                    data-testid="button-view-ended-polls"
                    sx={{ mb: 5, py: 3, display: historicalPolls.length > 0 ? undefined : 'none' }}
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
                    backgroundColor: 'secondary',
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
                  Reset filters
                </Button>
              </Flex>
            )}
          </Box>
          <Stack gap={3}>
            {account && bpi > 0 && (
              <ErrorBoundary componentName="Ballot">
                <BallotBox polls={polls} activePolls={activePolls} network={network} />
              </ErrorBoundary>
            )}

            <ErrorBoundary componentName="System Info">
              <SystemStatsSidebar
                fields={[
                  'polling contract v2',
                  'polling contract v1',
                  'arbitrum polling contract',
                  'savings rate',
                  'total dai',
                  'debt ceiling',
                  'system surplus'
                ]}
              />
            </ErrorBoundary>
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
  tags: prefetchedCategories
}: PollingPageData): JSX.Element {
  const { network } = useWeb3();

  const fallbackData = isDefaultNetwork(network)
    ? {
        polls: prefetchedPolls,
        tags: prefetchedCategories
      }
    : null;

  const { cache } = useSWRConfig();
  const cacheKey = `page/polling/${network}`;
  const { data, error } = useSWR<PollingPageData>(
    !network || isDefaultNetwork(network) ? null : cacheKey,
    () => fetchPollingPageData(network, true),
    {
      revalidateOnMount: !cache.get(cacheKey),
      ...(fallbackData && { fallbackData })
    }
  );

  if (!isDefaultNetwork(network) && !data && !error) {
    return <PageLoadingPlaceholder />;
  }

  if (error) {
    return (
      <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
        <ErrorPage statusCode={500} title="Error fetching data, please try again later." />;
      </PrimaryLayout>
    );
  }

  const props = {
    polls: isDefaultNetwork(network) ? prefetchedPolls : data?.polls || [],
    tags: isDefaultNetwork(network) ? prefetchedCategories : data?.tags || []
  };

  return (
    <ErrorBoundary componentName="Poll List">
      <PollingOverview {...props} />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { polls, tags } = await fetchPollingPageData(SupportedNetworks.MAINNET);

  return {
    revalidate: 60, // revalidate every 60 seconds
    props: {
      polls,
      tags
    }
  };
};
