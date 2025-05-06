/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React from 'react';
import { Heading, Flex, Box, Button, Divider, Grid, Text, Badge, Spinner, Card } from 'theme-ui';
import { useEffect, useMemo, useRef } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { GetStaticProps } from 'next';
import ErrorPage from 'modules/app/components/ErrorPage';
import { useLockedSky } from 'modules/mkr/hooks/useLockedSky';
import { useHat } from 'modules/executive/hooks/useHat';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { fetchJson } from 'lib/fetchJson';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';
import ProposalsSortBy from 'modules/executive/components/ProposalsSortBy';
import DateFilter from 'modules/executive/components/DateFilter';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import MkrSkyLiquiditySidebar from 'modules/mkr/components/MkrSkyLiquiditySidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ExecutiveOverviewCard from 'modules/executive/components/ExecutiveOverviewCard';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { ExecutiveBalance } from 'modules/executive/components/ExecutiveBalance';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { Proposal } from 'modules/executive/types';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useAccount } from 'modules/app/hooks/useAccount';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import useSWRInfinite from 'swr/infinite';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { ExecutivePageData, fetchExecutivePageData } from 'modules/executive/api/fetchExecutivePageData';
import { InternalLink } from 'modules/app/components/InternalLink';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import Icon from 'modules/app/components/Icon';
export const ExecutiveOverview = ({ proposals }: { proposals?: Proposal[] }): JSX.Element => {
  const { account, voteDelegateContractAddress, votingAccount } = useAccount();
  const network = useNetwork();

  const [showHistorical, setShowHistorical] = React.useState(false);

  const { data: lockedSky, mutate: mutateLockedSky } = useLockedSky(votingAccount);

  const { data: votedProposals, mutate: mutateVotedProposals } = useVotedProposals();
  const { data: mkrOnHat } = useMkrOnHat();

  const [startDate, endDate, sortBy, resetExecutiveFilters] = useUiFiltersStore(state => [
    state.executiveFilters.startDate,
    state.executiveFilters.endDate,
    state.executiveSortBy,
    state.resetExecutiveFilters
  ]);

  const EXEC_PAGE_SIZE = 10;

  // Use SWRInfinite to do a loaded pagination of the proposals
  // Preload with the server side data as "fallback"
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null; // reached the end

    const key = `/api/executive?network=${network}&start=${
      pageIndex * EXEC_PAGE_SIZE
    }&limit=${EXEC_PAGE_SIZE}&sortBy=${sortBy}${
      startDate ? `&startDate=${new Date(startDate).getTime()}` : ''
    }${endDate ? `&endDate=${new Date(endDate).getTime()}` : ''}`; // SWR key

    return key;
  };

  const {
    data: paginatedProposals,
    error,
    size,
    setSize,
    isValidating,
    mutate: mutatePaginatedProposals
  } = useSWRInfinite(getKey, fetchJson, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    initialSize: 1,
    revalidateFirstPage: true,
    persistSize: false,
    fallbackData: proposals
  });

  const isLoadingInitialData = !paginatedProposals && !error;

  const isLoadingMore =
    size > 0 && paginatedProposals && typeof paginatedProposals[size - 1] === 'undefined' && isValidating;

  const isEmpty = paginatedProposals?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (paginatedProposals && paginatedProposals[paginatedProposals.length - 1]?.length < EXEC_PAGE_SIZE);

  const loadMore = () => {
    setSize(size + 1);
  };

  // revalidate votedProposals if connected address changes
  useEffect(() => {
    mutateVotedProposals();
  }, [votingAccount]);

  useEffect(() => {
    setSize(1);
    mutatePaginatedProposals();
  }, [startDate, endDate]);

  const prevSortByRef = useRef<string>(sortBy);

  useEffect(() => {
    if (sortBy !== prevSortByRef.current) {
      prevSortByRef.current = sortBy;
      setShowHistorical(true);
    }
  }, [sortBy]);

  const flattenedProposals = useMemo(() => {
    return paginatedProposals?.flat() || [];
  }, [paginatedProposals]);

  const { data: hat } = useHat();

  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="Executive Proposals" />
      <Stack>
        {account && (
          <ExecutiveBalance
            lockedSky={lockedSky || 0n}
            mutateLockedSky={mutateLockedSky}
            voteDelegate={voteDelegateContractAddress}
          />
        )}
        <Flex sx={{ alignItems: 'center' }}>
          <Heading variant="microHeading" mr={3} sx={{ display: ['none', 'block'] }}>
            Filters
          </Heading>
          <ProposalsSortBy sx={{ mr: 3 }} />
          <DateFilter />
          {isValidating && <Spinner size={20} ml={3} />}
          {(startDate || endDate) && !isValidating && (
            <Button
              variant={'outline'}
              sx={{ ml: 3 }}
              onClick={resetExecutiveFilters}
              data-testid="executive-reset-filters"
            >
              Clear date filter
            </Button>
          )}
        </Flex>

        <SidebarLayout>
          <Box>
            <Stack gap={3}>
              <Heading as="h1">Executive Proposals</Heading>
              {/* Show loading skeleton initially */}
              {isLoadingInitialData && (
                <Box>
                  <Box my={3}>
                    <SkeletonThemed width={'100%'} height={'200px'} />
                  </Box>
                </Box>
              )}

              {/* Show no proposals found message */}
              {!isLoadingInitialData && !isValidating && flattenedProposals.length === 0 && (
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
                    No executive proposals found
                  </Text>
                  {(startDate || endDate) && (
                    <Button
                      variant={'textual'}
                      sx={{ color: 'primary', textDecoration: 'underline', mt: 2, fontSize: 3 }}
                      onClick={resetExecutiveFilters}
                    >
                      Reset filters
                    </Button>
                  )}
                </Flex>
              )}

              {/* Render active proposals */}
              {!isLoadingInitialData && flattenedProposals.filter(proposal => proposal.active).length > 0 && (
                <Stack gap={4} sx={{ mb: 4 }}>
                  {flattenedProposals
                    .filter(proposal => proposal.active)
                    .map((proposal, index) => (
                      <Box key={`proposal-${proposal.address}-${index}`}>
                        <ExecutiveOverviewCard
                          proposal={proposal}
                          isHat={hat ? hat.toLowerCase() === proposal.address.toLowerCase() : false}
                          account={account}
                          votedProposals={votedProposals}
                          mkrOnHat={mkrOnHat}
                        />
                      </Box>
                    ))}
                </Stack>
              )}

              {!showHistorical && flattenedProposals.filter(proposal => proposal.active).length > 0 && (
                <Grid columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
                  <Divider />
                  <Button
                    variant="mutedOutline"
                    onClick={() => {
                      setShowHistorical(true);
                    }}
                  >
                    View more proposals
                  </Button>
                  <Divider />
                </Grid>
              )}
              {(showHistorical || flattenedProposals.filter(proposal => proposal.active).length == 0) && (
                <div>
                  {flattenedProposals.filter(proposal => proposal.active).length > 0 && (
                    <Grid mb={4} columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
                      <Divider />
                      <Button
                        variant="mutedOutline"
                        onClick={() => {
                          setShowHistorical(false);
                        }}
                      >
                        View fewer proposals
                      </Button>
                      <Divider />
                    </Grid>
                  )}

                  <Stack gap={4}>
                    {flattenedProposals
                      .filter(proposal => !proposal.active)
                      .map((proposal, index) => (
                        <Box key={`proposal-${proposal.address}-${index}`}>
                          <ExecutiveOverviewCard
                            proposal={proposal}
                            isHat={hat ? hat.toLowerCase() === proposal.address.toLowerCase() : false}
                            account={account}
                            votedProposals={votedProposals}
                            mkrOnHat={mkrOnHat}
                          />
                        </Box>
                      ))}
                  </Stack>
                  {isLoadingMore && (
                    <Box>
                      <Box my={3}>
                        <SkeletonThemed width={'100%'} height={'200px'} />
                      </Box>
                      <Box my={3}>
                        <SkeletonThemed width={'100%'} height={'200px'} />
                      </Box>
                      <Box my={3}>
                        <SkeletonThemed width={'100%'} height={'200px'} />
                      </Box>
                    </Box>
                  )}

                  {!isReachingEnd && (
                    <Grid mb={5} mt={4} columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
                      <Divider />
                      <Button variant="mutedOutline" onClick={loadMore}>
                        Load more
                      </Button>
                      <Divider />
                    </Grid>
                  )}
                </div>
              )}
            </Stack>
          </Box>
          <Stack gap={3}>
            <Box sx={{ mb: 3 }}>
              <Heading mt={3} mb={2} as="h3" variant="microHeading">
                Custom Spell Voting
              </Heading>
              <Card variant="compact">
                <Text as="p" sx={{ mb: 3, color: 'textSecondary' }}>
                  It is also possible to vote on a custom spell address—only use this in case of emergencies!
                </Text>
                <Box>
                  <InternalLink href={'/custom-spell'} title="View custom spell voting page">
                    <Text color="accentBlue">View Custom Spell Voting Page</Text>
                  </InternalLink>
                </Box>
              </Card>
            </Box>
            <ErrorBoundary componentName="System Info">
              <SystemStatsSidebar
                fields={[
                  'chief contract',
                  'sky in chief',
                  'sky needed to pass',
                  'savings rate',
                  'total usds',
                  'debt ceiling'
                ]}
              />
            </ErrorBoundary>
            <ErrorBoundary componentName="MKR Liquidity">
              <MkrSkyLiquiditySidebar network={network} />
            </ErrorBoundary>
            <ResourceBox type={'executive'} />
            <ResourceBox type={'general'} />
          </Stack>
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function ExecutiveOverviewPage({
  proposals: prefetchedProposals
}: ExecutivePageData): JSX.Element {
  const network = useNetwork();

  const fallbackData = isDefaultNetwork(network)
    ? {
        proposals: prefetchedProposals
      }
    : null;

  const { cache } = useSWRConfig();
  const cacheKey = `page/executive/${network}`;
  const { data, error } = useSWR<ExecutivePageData>(
    !network || isDefaultNetwork(network) ? null : cacheKey,
    () => fetchExecutivePageData(network, true),
    {
      revalidateOnMount: !cache.get(cacheKey),
      ...(fallbackData && { fallbackData })
    }
  );

  if (!isDefaultNetwork(network) && !data && !error) {
    return <PageLoadingPlaceholder />;
  }

  if (error && error.status === 404) {
    return (
      <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
        <ErrorPage statusCode={404} title="Executive not found" />
      </PrimaryLayout>
    );
  } else if (error) {
    return (
      <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
        <ErrorPage statusCode={500} title="Error fetching data" />
      </PrimaryLayout>
    );
  }

  const props = {
    proposals: isDefaultNetwork(network) ? prefetchedProposals : data?.proposals || []
  };

  return (
    <ErrorBoundary componentName="Executive Page">
      <ExecutiveOverview {...props} />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { proposals } = await fetchExecutivePageData(SupportedNetworks.MAINNET);

  return {
    revalidate: 60 * 30, // allow revalidation every half an hour in seconds
    props: {
      proposals,
      staticPageGenerationTimeout: 180
    }
  };
};
