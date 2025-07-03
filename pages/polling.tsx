/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { GetServerSideProps } from 'next';
import { Heading, Box, Button, Text, Alert, Spinner, Flex } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ResourceBox from 'modules/app/components/ResourceBox';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import SkyPollOverviewCard, { SkyPoll } from 'modules/polling/components/SkyPollOverviewCard';
import { TagCount } from 'modules/app/types/tag';
import { useState, useEffect } from 'react';
import { SkyPollsResponse } from './api/sky/polls';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';

type PollingPageProps = {
  initialData?: SkyPollsResponse;
  error?: string;
};

// Transform API poll data to match SkyPoll type
const transformPoll = (poll: any): SkyPoll => {
  const transformed: any = {
    ...poll,
    options: Array.isArray(poll.options)
      ? poll.options.reduce((acc: any, opt: any, idx: number) => ({ ...acc, [idx.toString()]: opt }), {})
      : poll.options || {}
  };

  // Transform tally if it exists
  if (poll.tally) {
    transformed.tally = {
      ...poll.tally,
      parameters: {
        ...poll.parameters,
        ...poll.tally.parameters
      },
      // Map MKR fields to Sky fields
      totalSkyParticipation: poll.tally.totalMkrParticipation || '0',
      totalSkyActiveParticipation: poll.tally.totalMkrParticipation || '0',
      winningOptionName: poll.tally.winningOption,
      votesByAddress: poll.tally.voteBreakdown || [],
      results: poll.tally.results.map((result: any) => ({
        ...result,
        skySupport: result.mkrSupport || '0',
        optionName: poll.options?.[result.optionId] || `Option ${result.optionId}`,
        winner: false,
        transfer: '0',
        transferPct: 0
      }))
    };
  }

  return transformed as SkyPoll;
};

export default function PollingPage({ initialData, error: initialError }: PollingPageProps): JSX.Element {
  const [skyPolls, setSkyPolls] = useState<SkyPoll[]>(initialData?.polls?.map(transformPoll) || []);
  const [tags, setTags] = useState<TagCount[]>(
    initialData?.tags?.map(tag => ({ ...tag, count: tag.count || 0 })) || []
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(initialError || null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialData?.paginationInfo?.hasNextPage || false);

  const fetchSkyPolls = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sky/polls?pageSize=5&page=${pageNum}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch polls: ${response.status}`);
      }

      const data: SkyPollsResponse = await response.json();

      const transformedPolls = data.polls.map(transformPoll);

      if (append) {
        setSkyPolls(prev => [...prev, ...transformedPolls]);
      } else {
        setSkyPolls(transformedPolls);
        setTags(data.tags.map(tag => ({ ...tag, count: tag.count || 0 })));
      }

      setHasMore(data.paginationInfo.hasNextPage);
    } catch (err) {
      console.error('Error fetching Sky polls:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Sky polls');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSkyPolls(nextPage, true);
  };

  useEffect(() => {
    if (!initialData) {
      fetchSkyPolls(1);
    }
  }, [initialData]);
  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="Polls" />

      <SidebarLayout>
        <Box>
          <Stack gap={4}>
            <Alert variant="notice" sx={{ mb: 2 }}>
              <Flex
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: ['column', 'column', 'row'],
                  my: 2
                }}
              >
                <Text>
                  The community has voted for governance to be migrated to a fully SKY-native system. This
                  page now displays governance polls from the Sky governance system. Legacy polls can be
                  viewed on the Legacy Polls page linked on the right.{' '}
                  <ExternalLink
                    href="https://upgrademkrtosky.sky.money/"
                    title="Learn more about governance migration"
                  >
                    <span style={{ color: 'accentBlue' }}>Click here</span>
                  </ExternalLink>{' '}
                  to learn more about the governance migration.
                </Text>
                <Box sx={{ minWidth: '164px', mt: [2, 2, 0], ml: [0, 0, 2] }}>
                  <InternalLink href="/legacy-polling" title="View Legacy Polls">
                    <Button variant="outline">View Legacy Polls</Button>
                  </InternalLink>
                </Box>
              </Flex>
            </Alert>

            {/* Sky Polls Section */}
            {error ? (
              <Alert variant="error" sx={{ mb: 4 }}>
                <Text>Error loading Sky polls: {error}</Text>
                <Button variant="outline" sx={{ mt: 2 }} onClick={() => fetchSkyPolls(1)}>
                  Retry
                </Button>
              </Alert>
            ) : (
              <Box>
                <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Heading as="h3">Polls from Sky Governance</Heading>
                  <ExternalLink href="https://vote.sky.money/polling" title="Vote on Sky Governance">
                    <Button variant="primary">View on Sky Portal</Button>
                  </ExternalLink>
                </Flex>

                {loading && skyPolls.length === 0 ? (
                  <Stack gap={4}>
                    {[...Array(4)].map((_, i) => (
                      <SkeletonThemed key={i} height="300px" />
                    ))}
                  </Stack>
                ) : skyPolls.length > 0 ? (
                  <Box>
                    <Stack gap={4} sx={{ mb: 4 }}>
                      {skyPolls.map(poll => (
                        <Box key={poll.pollId}>
                          <SkyPollOverviewCard poll={poll} />
                        </Box>
                      ))}
                    </Stack>

                    {hasMore && (
                      <Flex sx={{ justifyContent: 'center', mt: 4 }}>
                        <Button
                          variant="outline"
                          onClick={loadMore}
                          disabled={loading}
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          {loading && <Spinner size={16} />}
                          Load More Polls
                        </Button>
                      </Flex>
                    )}
                  </Box>
                ) : (
                  <Text sx={{ fontStyle: 'italic', color: 'textSecondary' }}>
                    No polls available from Sky governance.
                  </Text>
                )}
              </Box>
            )}
          </Stack>
        </Box>

        <Stack gap={3}>
          <ErrorBoundary componentName="System Info">
            <SystemStatsSidebar
              fields={['chief contract', 'mkr in chief', 'savings rate', 'total dai', 'debt ceiling']}
            />
          </ErrorBoundary>
          <ResourceBox type={'polling'} />
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
}

export const getServerSideProps: GetServerSideProps<PollingPageProps> = async () => {
  try {
    // Try to fetch initial data server-side
    const apiUrl = 'https://vote.sky.money/api/polling/all-polls-with-tally';
    const url = new URL(apiUrl);
    url.searchParams.set('pageSize', '5');
    url.searchParams.set('page', '1');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add timeout for the request
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const initialData: SkyPollsResponse = await response.json();
      return {
        props: {
          initialData
        }
      };
    } else {
      console.error('Failed to fetch initial Sky polls data:', response.status);
      return {
        props: {
          error: `Failed to fetch polls (status: ${response.status})`
        }
      };
    }
  } catch (error) {
    console.error('Error fetching initial Sky polls data:', error);
    return {
      props: {
        error: 'Failed to connect to Sky governance API'
      }
    };
  }
};
