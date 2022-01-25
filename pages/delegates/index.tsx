import { useState, useEffect, useMemo } from 'react';
import { Heading, Box, Flex, Card, Text, Link as ThemeUILInk, Button } from 'theme-ui';
import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import shallow from 'zustand/shallow';
import { fetchJson } from 'lib/fetchJson';
import { shuffleArray } from 'lib/common/shuffleArray';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import useDelegatesFiltersStore, { delegatesSortEnum } from 'modules/delegates/stores/delegatesFiltersStore';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { isDefaultNetwork } from 'modules/web3/helpers/isDefaultNetwork';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { Delegate, DelegatesAPIResponse, DelegatesAPIStats } from 'modules/delegates/types';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ResourceBox from 'modules/app/components/ResourceBox';
import { DelegateCard } from 'modules/delegates/components';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { DelegatesSystemInfo } from 'modules/delegates/components/DelegatesSystemInfo';
import DelegatesFilter from 'modules/delegates/components/DelegatesFilter';
import DelegatesSort from 'modules/delegates/components/DelegatesSort';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

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

  const styles = {
    delegateGroup: {
      marginBottom: 2
    }
  };

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

      <Flex sx={{ alignItems: 'center', flexDirection: ['column', 'row'] }}>
        <Flex sx={{ alignItems: 'center' }}>
          <Heading variant="microHeading" mr={3} sx={{ display: ['none', 'block'] }}>
            Filters
          </Heading>
          <DelegatesFilter delegates={delegates} />
        </Flex>

        <Flex sx={{ ml: [0, 3], mt: [2, 0] }}>
          <Button
            variant={'outline'}
            sx={{ mr: 3 }}
            onClick={resetFilters}
            data-testid="delegate-reset-filters"
          >
            Clear filters
          </Button>

          <DelegatesSort />
        </Flex>
      </Flex>

      <SidebarLayout>
        <Box>
          {sortedDelegates && sortedDelegates.length === 0 && <Text>No delegates found</Text>}
          {recognizedDelegates.length > 0 && (
            <Box sx={styles.delegateGroup}>
              <Heading mb={3} mt={3} as="h4">
                Recognized Delegates
              </Heading>

              <Box>
                {recognizedDelegates.map(delegate => (
                  <Box key={delegate.id} sx={{ mb: 4 }}>
                    <DelegateCard delegate={delegate} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {shadowDelegates.length > 0 && (
            <Box sx={styles.delegateGroup}>
              <Heading mb={3} mt={3} as="h4">
                Shadow Delegates
              </Heading>

              <Box>
                {shadowDelegates.map(delegate => (
                  <Box key={delegate.id} sx={{ mb: 4 }}>
                    <DelegateCard delegate={delegate} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {expiredDelegates.length > 0 && (
            <Box sx={styles.delegateGroup}>
              <Heading mb={3} mt={3} as="h4">
                Expired Delegates
              </Heading>

              <Box>
                {expiredDelegates.map(delegate => (
                  <Box key={delegate.id} sx={{ mb: 4 }}>
                    <DelegateCard delegate={delegate} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
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
                <Link
                  href={{
                    pathname: '/account'
                  }}
                  passHref
                >
                  <ThemeUILInk onClick={() => trackButtonClick('viewAccount')} title="My account">
                    <Text>View Account Page</Text>
                  </ThemeUILInk>
                </Link>
              </Box>
            </Card>
          </Box>
          {stats && <DelegatesSystemInfo stats={stats} />}
          <ResourceBox type={'delegates'} />
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function DelegatesPage({ delegates, stats }: Props): JSX.Element {
  const [_delegates, _setDelegates] = useState<Delegate[]>();
  const [_stats, _setStats] = useState<DelegatesAPIStats>();
  const [error, setError] = useState<string>();
  const { chainId } = useActiveWeb3React();

  // fetch delegates at run-time if on any network other than the default
  useEffect(() => {
    if (!chainId) return;
    if (!isDefaultNetwork(chainId)) {
      fetchJson(`/api/delegates?network=${chainIdToNetworkName(chainId)}`)
        .then((response: DelegatesAPIResponse) => {
          _setDelegates(shuffleArray(response.delegates));
          _setStats(response.stats);
        })
        .catch(setError);
    }
  }, [chainId]);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching delegates" />;
  }

  if (!isDefaultNetwork(chainId) && !_delegates) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );
  }

  return (
    <Delegates
      delegates={isDefaultNetwork(chainId) ? delegates : (_delegates as Delegate[])}
      stats={isDefaultNetwork(chainId) ? stats : (_stats as DelegatesAPIStats)}
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const delegatesAPIResponse = await fetchDelegates();

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      // Shuffle in the backend, this will be changed depending on the sorting order.
      delegates: shuffleArray(delegatesAPIResponse.delegates),
      stats: delegatesAPIResponse.stats
    }
  };
};
