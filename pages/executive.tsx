import React from 'react';
import { Heading, Flex, Box, Button, Divider, Grid, Text, Badge, Spinner } from 'theme-ui';
import { useEffect, useState, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import { Icon } from '@makerdao/dai-ui-icons';

// lib
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { useHat } from 'modules/executive/hooks/useHat';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { fetchJson } from 'lib/fetchJson';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';

// components
import Deposit from 'modules/mkr/components/Deposit';
import WithdrawOldChief from 'modules/executive/components/WithdrawOldChief';
import ProposalsSortBy from 'modules/executive/components/ProposalsSortBy';
import DateFilter from 'modules/executive/components/DateFilter';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import MkrLiquiditySidebar from 'modules/mkr/components/MkrLiquiditySidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ExecutiveOverviewCard from 'modules/executive/components/ExecutiveOverviewCard';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import ProgressBar from 'modules/executive/components/ProgressBar';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { ExecutiveBalance } from 'modules/executive/components/ExecutiveBalance';
import { ExternalLink } from 'modules/app/components/ExternalLink';

// stores
import useUiFiltersStore from 'modules/app/stores/uiFilters';

// types
import { Proposal } from 'modules/executive/types';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { EXEC_PAGE_SIZE } from 'modules/executive/executive.constants';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { MainnetSdk } from '@dethcrypto/eth-sdk-client';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import useSWRInfinite from 'swr/infinite';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';

const MigrationBadge = ({ children, py = [2, 3] }) => (
  <Badge
    variant="primary"
    sx={{
      textTransform: 'none',
      borderColor: 'primary',
      borderRadius: 'small',
      width: '100%',
      whiteSpace: 'normal',
      fontWeight: 'normal',
      fontSize: [1, 2],
      px: [3, 4],
      my: 3,
      py
    }}
  >
    {children}
  </Badge>
);

export const ExecutiveOverview = ({ proposals }: { proposals?: Proposal[] }): JSX.Element => {
  const { account, voteDelegateContractAddress, voteProxyContractAddress, voteProxyOldContractAddress } =
    useAccount();
  const { network } = useActiveWeb3React();
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);

  const [showHistorical, setShowHistorical] = React.useState(false);

  const address = voteDelegateContractAddress || voteProxyContractAddress || account;
  const { data: lockedMkr } = useLockedMkr(address, voteProxyContractAddress, voteDelegateContractAddress);

  const { data: votedProposals, mutate: mutateVotedProposals } = useVotedProposals();
  const { chiefOld } = useContracts() as MainnetSdk;
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
  }, [address]);

  useEffect(() => {
    setSize(1);
    mutatePaginatedProposals();
  }, [startDate, endDate]);

  const lockedMkrKeyOldChief = voteProxyOldContractAddress || account;
  const { data: lockedMkrOldChief } = useSWR(
    lockedMkrKeyOldChief ? ['/user/mkr-locked-old-chief', lockedMkrKeyOldChief] : null,
    () => chiefOld.deposits(lockedMkrKeyOldChief as string)
  );

  const votingForSomething = votedProposals && votedProposals.length > 0;

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

  const showProxyInfo =
    lockedMkrOldChief &&
    lockedMkrOldChief.eq(0) &&
    !voteProxyContractAddress &&
    lockedMkr &&
    lockedMkr.eq(0) &&
    !voteDelegateContractAddress;

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="Executive Proposals" />

      {lockedMkrOldChief && lockedMkrOldChief.gt(0) && (
        <>
          <ProgressBar step={0} />
          <MigrationBadge py={[2]}>
            <Flex
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                alignContent: 'space-between',
                flexWrap: 'wrap'
              }}
            >
              <Text sx={{ py: 2 }}>
                An executive vote has passed to update the Chief to a new version. You have{' '}
                <b>{formatValue(lockedMkrOldChief)} MKR</b> to withdraw from the old chief.
              </Text>
              <Flex>
                <WithdrawOldChief />
                <ExternalLink
                  href="https://forum.makerdao.com/t/dschief-v1-2-migration-steps/5412"
                  title="View migration steps"
                >
                  <Button
                    variant="outline"
                    sx={{
                      height: '26px',
                      py: 0,
                      px: 2,
                      ml: 1,
                      textTransform: 'uppercase',
                      borderRadius: 'small',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      borderColor: 'accentBlue',
                      color: 'accentBlue',
                      ':hover': { color: 'blueLinkHover', borderColor: 'blueLinkHover' },
                      ':hover svg': { color: 'blueLinkHover' }
                    }}
                    onClick={() => {
                      trackButtonClick('chiefMigrationForumPostButton');
                    }}
                  >
                    <Text>
                      Forum Post <Icon name="arrowTopRight" size={2} ml={'1px'} color="accentBlue" />
                    </Text>
                  </Button>
                </ExternalLink>
              </Flex>
            </Flex>
          </MigrationBadge>
        </>
      )}
      {votedProposals &&
        !votingForSomething &&
        lockedMkrOldChief &&
        lockedMkrOldChief.eq(0) &&
        voteProxyContractAddress &&
        lockedMkr &&
        !voteDelegateContractAddress && (
          <>
            <ProgressBar step={lockedMkr.eq(0) ? 1 : 2} />
            <MigrationBadge>
              {lockedMkr.eq(0) ? (
                <Text>
                  Your vote proxy has been created. Please{' '}
                  <Deposit link={'deposit'} showProxyInfo={showProxyInfo} /> into your new vote proxy contract
                </Text>
              ) : (
                'Your vote proxy has been created. You are now ready to vote.'
              )}
            </MigrationBadge>
          </>
        )}
      {votedProposals &&
        !votingForSomething &&
        lockedMkrOldChief &&
        lockedMkrOldChief.eq(0) &&
        !voteProxyContractAddress &&
        lockedMkr &&
        lockedMkr.gt(0) && (
          <>
            <ProgressBar step={2} />
            <MigrationBadge>Your MKR has been deposited. You are now ready to vote.</MigrationBadge>
          </>
        )}
      <Stack>
        {account && (
          <ExecutiveBalance
            lockedMkr={lockedMkr || BigNumber.from(0)}
            voteDelegate={voteDelegateContractAddress}
            showProxyInfo={showProxyInfo}
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
              {!isLoadingInitialData && (
                <Stack gap={4} sx={{ mb: 4 }}>
                  {flattenedProposals
                    .filter(proposal => proposal.active)
                    .map((proposal, index) => (
                      <Box key={`proposal-${proposal.address}-${index}`}>
                        <ExecutiveOverviewCard
                          proposal={proposal}
                          isHat={hat ? hat.toLowerCase() === proposal.address.toLowerCase() : false}
                          network={network}
                          account={account}
                          votedProposals={votedProposals}
                          mkrOnHat={mkrOnHat}
                        />
                      </Box>
                    ))}
                </Stack>
              )}

              {(startDate || endDate) && flattenedProposals && flattenedProposals.length === 0 && (
                <Text>No proposals found. Please try clearing filters.</Text>
              )}

              {isLoadingInitialData && (
                <Box>
                  <Box my={3}>
                    <SkeletonThemed width={'100%'} height={'200px'} />
                  </Box>
                </Box>
              )}
              {!showHistorical && flattenedProposals.filter(proposal => proposal.active).length > 0 && (
                <Grid columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
                  <Divider />
                  <Button
                    variant="mutedOutline"
                    onClick={() => {
                      trackButtonClick('showHistoricalExecs');
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
                          trackButtonClick('hideHistoricalExecs');
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
                            network={network}
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
                    <Grid mt={4} columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
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
            <ErrorBoundary componentName="System Info">
              <SystemStatsSidebar
                fields={[
                  'chief contract',
                  'mkr in chief',
                  'mkr needed to pass',
                  'savings rate',
                  'total dai',
                  'debt ceiling'
                ]}
              />
            </ErrorBoundary>
            <ErrorBoundary componentName="MKR Liquidity">
              <MkrLiquiditySidebar network={network} />
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
}: {
  proposals: Proposal[];
}): JSX.Element {
  const [_proposals, _setProposals] = useState<Proposal[]>();
  const [error, setError] = useState<string>();
  const { network } = useActiveWeb3React();

  // fetch proposals at run-time if on any network other than the default
  useEffect(() => {
    if (!network) return;
    if (!isDefaultNetwork(network)) {
      fetchJson(`/api/executive?network=${network}&start=0&limit=${EXEC_PAGE_SIZE}`)
        .then(_setProposals)
        .catch(setError);
    }
  }, [network]);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork(network) && !_proposals) {
    return <PageLoadingPlaceholder />;
  }

  return (
    <ErrorBoundary componentName="Executive Page">
      <ExecutiveOverview proposals={isDefaultNetwork(network) ? prefetchedProposals : _proposals} />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch proposals at build-time if on the default network
  const proposals = await getExecutiveProposals(0, EXEC_PAGE_SIZE, 'active');

  return {
    revalidate: 60 * 30, // allow revalidation every half an hour in seconds
    props: {
      proposals,
      staticPageGenerationTimeout: 120
    }
  };
};
