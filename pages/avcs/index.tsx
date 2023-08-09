/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useBreakpointIndex } from '@theme-ui/match-media';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import ErrorPage from 'modules/app/components/ErrorPage';
import { Icon } from '@makerdao/dai-ui-icons';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { SearchBar } from 'modules/app/components/filters/SearchBar';
import { HeadComponent } from 'modules/app/components/layout/Head';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { fetchAvcsPageData } from 'modules/avcs/api/fetchAvcsPageData';
import { AvcsAPIResponse } from 'modules/avcs/types/avc';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { GetStaticProps } from 'next';
import { useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Box, Button, Flex, Heading, Text } from 'theme-ui';
import useAvcsFiltersStore from 'modules/avcs/stores/avcsFiltersStore';
import shallow from 'zustand/shallow';
import { AvcsSortFilter } from 'modules/avcs/components/filters/AvcsSortFilter';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import { AvcsSystemInfo } from 'modules/avcs/components/AvcsSystemInfo';
import ResourceBox from 'modules/app/components/ResourceBox';
import { AvcOverviewCard } from 'modules/avcs/components/AvcOverviewCard';
import { AvcOrderByEnum } from 'modules/avcs/avcs.constants';

const AlignedVotingCommittees = ({ avcs: propAvcs, stats }: AvcsAPIResponse) => {
  const [name, sort, setName, resetFilters] = useAvcsFiltersStore(
    state => [state.filters.name, state.filters.sort, state.setName, state.resetFilters],
    shallow
  );

  // only for mobile
  const [showFilters, setShowFilters] = useState(false);
  const bpi = useBreakpointIndex();

  const avcs = useMemo(
    () =>
      propAvcs
        .filter(avc => (name ? avc.name.toLowerCase().includes(name.toLowerCase()) : true))
        .sort((a, b) =>
          sort === AvcOrderByEnum.DELEGATES
            ? b.delegateCount - a.delegateCount
            : sort === AvcOrderByEnum.MKR_DELEGATED
            ? +b.mkrDelegated - +a.mkrDelegated
            : 0
        ),
    [name, sort, propAvcs]
  );

  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="AVCs" description="" image="" />
      <Stack>
        <Flex sx={{ alignItems: 'center', flexDirection: ['column', 'row'] }}>
          <Button
            variant="textual"
            sx={{ display: ['block', 'none'], color: 'onSecondary' }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Text sx={{ mr: 1 }}>{showFilters ? 'Hide AVC filters' : 'Show AVC filters'}</Text>
            <Icon name={showFilters ? 'chevron_down' : 'chevron_right'} size={2} />
          </Button>
          {(showFilters || bpi > 0) && (
            <Flex sx={{ flexDirection: ['column', 'column', 'column', 'row'] }}>
              <Flex
                sx={{
                  justifyContent: ['center', 'center', 'center', 'flex-start'],
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <SearchBar
                  sx={{ m: 2 }}
                  onChange={setName}
                  value={name}
                  placeholder="AVC name"
                  withSearchButton={true}
                  performSearchOnClear={true}
                />
                <AvcsSortFilter />
              </Flex>
              <Button
                variant={'outline'}
                data-testid="delegate-reset-filters"
                sx={{
                  m: 2,
                  color: 'textSecondary',
                  border: 'none'
                }}
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            </Flex>
          )}
        </Flex>

        <SidebarLayout>
          <Box>
            {avcs.length === 0 ? (
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
                  No AVCs found
                </Text>
                <Button
                  variant={'textual'}
                  sx={{ color: 'primary', textDecoration: 'underline', mt: 2, fontSize: 3 }}
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              </Flex>
            ) : (
              <Stack gap={3}>
                <Heading as="h1">Aligned Voter Committees</Heading>

                {avcs.map(avc => (
                  <Box key={avc.id} sx={{ mb: 3 }}>
                    <ErrorBoundary componentName="Delegate Card">
                      <AvcOverviewCard avc={avc} />
                    </ErrorBoundary>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Stack gap={3}>
            <ResourceBox type="avcs" />
            {stats && (
              <ErrorBoundary componentName="Delegates System Info">
                <AvcsSystemInfo stats={stats} />
              </ErrorBoundary>
            )}
            <ResourceBox type="general" />
          </Stack>
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function AvcsPage({ avcs: prefetchedAvcs, stats: prefetchedStats }): JSX.Element {
  const { network } = useWeb3();

  const fallbackData = isDefaultNetwork(network)
    ? {
        avcs: prefetchedAvcs,
        stats: prefetchedStats
      }
    : null;

  const { cache } = useSWRConfig();
  const cacheKey = `page/avcs/${network}`;
  const { data, error } = useSWR<AvcsAPIResponse>(
    !network || isDefaultNetwork(network) ? null : cacheKey,
    () => fetchAvcsPageData(network, true),
    {
      revalidateOnMount: !cache.get(cacheKey),
      ...(fallbackData && { fallbackData })
    }
  );

  if (!isDefaultNetwork(network) && !data && !error) return <PageLoadingPlaceholder />;

  if (error)
    return (
      <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
        <ErrorPage statusCode={500} title="Error fetching data. Please, try again later." />
      </PrimaryLayout>
    );

  const props = {
    avcs: isDefaultNetwork(network) ? prefetchedAvcs : data?.avcs || [],
    stats: isDefaultNetwork(network)
      ? prefetchedStats
      : data?.stats || {
          totalCount: 0
        }
  };

  return (
    <ErrorBoundary componentName="AVC List">
      <AlignedVotingCommittees {...props} />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { avcs, stats } = await fetchAvcsPageData(SupportedNetworks.MAINNET, false);

  return {
    revalidate: 60 * 30, // allow revalidation every 30 minutes
    props: {
      avcs,
      stats
    }
  };
};
