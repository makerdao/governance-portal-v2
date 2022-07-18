import { useState } from 'react';
import { Box, Button, Card, Flex, Heading, Text, Input } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { fetchJson } from 'lib/fetchJson';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import {
  delegatesCacheKey,
  executiveSupportersCacheKey,
  getAllPollsCacheKey,
  getPollTallyCacheKey,
  githubExecutivesCacheKey
} from 'modules/cache/constants/cache-keys';
import { toast } from 'react-toastify';

const DashboardPage = (): React.ReactElement => {
  const { network } = useActiveWeb3React();
  const [loading, setLoading] = useState(false);
  const [pollId, setPollId] = useState('');

  const invalidateCache = async (cacheKey: string) => {
    setLoading(true);
    try {
      await fetchJson(`/api/cache/invalidate?network=${network}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cacheKey
        })
      });
      setLoading(false);
      toast.success('Cache cleared');
    } catch (e) {
      setLoading(false);
      toast.error('Error invalidating cache');
    }
  };

  return (
    <PrimaryLayout sx={{ maxWidth: 'page' }}>
      <HeadComponent title="Dashboard" />
      <Stack gap={3}>
        <Heading>Dashboard</Heading>

        <Card>
          <ErrorBoundary componentName="Cache invalidation">
            <Text as="h3">Invalidate cache</Text>
            {loading && <Box>Clearing selected cache...</Box>}
            <Flex sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ m: 3 }}>
                <Button onClick={() => invalidateCache(getAllPollsCacheKey())} disabled={loading}>
                  All polls
                </Button>
              </Box>
              <Box sx={{ m: 3 }}>
                <Button onClick={() => invalidateCache(executiveSupportersCacheKey)} disabled={loading}>
                  Executive supporters
                </Button>
              </Box>
              <Box sx={{ m: 3 }}>
                <Button onClick={() => invalidateCache(githubExecutivesCacheKey)} disabled={loading}>
                  Executives from GitHub
                </Button>
              </Box>
              <Box sx={{ m: 3 }}>
                <Button onClick={() => invalidateCache(delegatesCacheKey)} disabled={loading}>
                  Delegates
                </Button>
              </Box>
              <Flex sx={{ m: 3 }}>
                <Input
                  type="text"
                  value={pollId}
                  onChange={e => setPollId(e.target.value)}
                  placeholder="poll-id (ex: 242)"
                  sx={{ mr: 2 }}
                />
                <Button
                  onClick={() => invalidateCache(getPollTallyCacheKey(parseInt(pollId)))}
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                >
                  Tally by poll ID
                </Button>
              </Flex>
            </Flex>
          </ErrorBoundary>
        </Card>
      </Stack>
    </PrimaryLayout>
  );
};

export default DashboardPage;
