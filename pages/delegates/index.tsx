import { useState, useEffect, useMemo } from 'react';
import { Heading, Box, Flex, Card, Text, Button } from 'theme-ui';
import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import shallow from 'zustand/shallow';
import { fetchJson } from 'lib/fetchJson';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import useDelegatesFiltersStore, { delegatesSortEnum } from 'modules/delegates/stores/delegatesFiltersStore';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { Delegate, DelegatesAPIResponse, DelegatesAPIStats } from 'modules/delegates/types';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ResourceBox from 'modules/app/components/ResourceBox';
import { DelegateOverviewCard } from 'modules/delegates/components';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { DelegatesSystemInfo } from 'modules/delegates/components/DelegatesSystemInfo';
import DelegatesFilter from 'modules/delegates/components/DelegatesFilter';
import DelegatesSort from 'modules/delegates/components/DelegatesSort';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { InternalLink } from 'modules/app/components/InternalLink';

type Props = {
  delegates: Delegate[];
  stats: DelegatesAPIStats;
};

const Delegates = ({ delegates, stats }: Props) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);
  const [showRecognized, showShadow, sort, resetFilters] = useDelegatesFiltersStore(
    state => [state.filters.showRecognized, state.filters.showShadow, state.sort, state.resetFilters],
    shallow
  );

  const filteredDelegates = useMemo(() => {
    return filterDelegates(delegates, showShadow, showRecognized);
  }, [delegates, showRecognized, showShadow]);

  const sortedDelegates = useMemo(() => {
    return filteredDelegates.sort((prev, next) => {
      if (sort === delegatesSortEnum.creationDate) {
        return prev.expirationDate > next.expirationDate ? -1 : 1;
      } else if (sort === delegatesSortEnum.mkrDelegated) {
        return new BigNumberJS(prev.mkrDelegated).gt(new BigNumberJS(next.mkrDelegated)) ? -1 : 1;
      } else if (sort === delegatesSortEnum.random) {
        return delegates.indexOf(prev) > delegates.indexOf(next) ? 1 : -1;
      }

      return 1;
    });
  }, [filteredDelegates, sort]);

  const { voteDelegateContractAddress } = useAccount();
  const isOwner = d => d.voteDelegateAddress.toLowerCase() === voteDelegateContractAddress?.toLowerCase();

  const expiredDelegates = sortedDelegates.filter(delegate => delegate.expired === true);

  const recognizedDelegates = sortedDelegates
    .filter(delegate => delegate.status === DelegateStatusEnum.recognized && !delegate.expired)
    .sort(d => (isOwner(d) ? -1 : 0));

  const shadowDelegates = sortedDelegates
    .filter(delegate => delegate.status === DelegateStatusEnum.shadow && !delegate.expired)
    .sort(d => (isOwner(d) ? -1 : 0));

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent
        title="Delegates"
        description="Vote delegation allows for MKR holders to delegate their voting power to delegates, which increases the effectiveness and efficiency of the governance process."
        image={'https://vote.makerdao.com/seo/delegates.png'}
      />
      <Stack>
        <Flex sx={{ alignItems: 'center', flexDirection: ['column', 'row'] }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Heading variant="microHeading" mr={3} sx={{ display: ['none', 'block'] }}>
              Filters
            </Heading>
            <DelegatesSort />
          </Flex>

          <Flex sx={{ ml: [0, 3], mt: [2, 0] }}>
            <DelegatesFilter delegates={delegates} />
            <Button
              variant={'outline'}
              sx={{ ml: 3 }}
              onClick={resetFilters}
              data-testid="delegate-reset-filters"
            >
              Clear filters
            </Button>
          </Flex>
        </Flex>

        <SidebarLayout>
          <Box>
            <Stack gap={3}>
              {sortedDelegates && sortedDelegates.length === 0 && <Text>No delegates found</Text>}

              {recognizedDelegates.length > 0 && (
                <Stack gap={3}>
                  <Heading as="h1">Recognized Delegates</Heading>

                  {recognizedDelegates.map(delegate => (
                    <Box key={delegate.id} sx={{ mb: 3 }}>
                      <ErrorBoundary componentName="Delegate Card">
                        <DelegateOverviewCard delegate={delegate} />
                      </ErrorBoundary>
                    </Box>
                  ))}
                </Stack>
              )}

              {shadowDelegates.length > 0 && (
                <Stack gap={3}>
                  <Heading as="h1">Shadow Delegates</Heading>

                  {shadowDelegates.map(delegate => (
                    <Box key={delegate.id} sx={{ mb: 3 }}>
                      <ErrorBoundary componentName="Delegate Card">
                        <DelegateOverviewCard delegate={delegate} />
                      </ErrorBoundary>
                    </Box>
                  ))}
                </Stack>
              )}

              {expiredDelegates.length > 0 && (
                <Stack gap={3}>
                  <Heading as="h1">Expired Delegates</Heading>

                  {expiredDelegates.map(delegate => (
                    <Box key={delegate.id} sx={{ mb: 3 }}>
                      <ErrorBoundary componentName="Delegate Card">
                        <DelegateOverviewCard delegate={delegate} />
                      </ErrorBoundary>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>

          <Stack gap={3}>
            <Box>
              <Heading mt={3} mb={2} as="h3" variant="microHeading">
                Delegate Contracts
              </Heading>
              <Card variant="compact">
                <Text as="p" sx={{ mb: 3 }}>
                  {voteDelegateContractAddress
                    ? 'Looking for delegate contract information?'
                    : 'Interested in creating a delegate contract?'}
                </Text>
                <Box>
                  <InternalLink
                    href={'/account'}
                    title="My account"
                    // TODO: onClick={() => trackButtonClick('viewAccount')}
                  >
                    <Text>View Account Page</Text>
                  </InternalLink>
                </Box>
              </Card>
            </Box>
            {stats && (
              <ErrorBoundary componentName="Delegates System Info">
                <DelegatesSystemInfo stats={stats} />
              </ErrorBoundary>
            )}
            <ResourceBox type={'delegates'} />
            <ResourceBox type={'general'} />
          </Stack>
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function DelegatesPage({ delegates, stats }: Props): JSX.Element {
  const [_delegates, _setDelegates] = useState<Delegate[]>();
  const [_stats, _setStats] = useState<DelegatesAPIStats>();
  const [error, setError] = useState<string>();
  const { network } = useActiveWeb3React();

  // fetch delegates at run-time if on any network other than the default
  useEffect(() => {
    if (!network) return;
    if (!isDefaultNetwork(network)) {
      fetchJson(`/api/delegates?network=${network}`)
        .then((response: DelegatesAPIResponse) => {
          _setDelegates(response.delegates);
          _setStats(response.stats);
        })
        .catch(setError);
    }
  }, [network]);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching delegates" />;
  }

  if (!isDefaultNetwork(network) && !_delegates) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );
  }

  return (
    <ErrorBoundary componentName="Delegates List">
      <Delegates
        delegates={isDefaultNetwork(network) ? delegates : (_delegates as Delegate[])}
        stats={isDefaultNetwork(network) ? stats : (_stats as DelegatesAPIStats)}
      />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const delegatesAPIResponse = await fetchDelegates();

  return {
    revalidate: 60 * 30, // allow revalidation every 30 minutes
    props: {
      // Shuffle in the backend, this will be changed depending on the sorting order.
      delegates: delegatesAPIResponse.delegates,
      stats: delegatesAPIResponse.stats
    }
  };
};
