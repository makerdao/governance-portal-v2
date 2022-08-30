import { useState } from 'react';
import { Box, Button, Card, Flex, Heading, Text, Input } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { fetchJson } from 'lib/fetchJson';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import {
  allDelegatesCacheKey,
  delegatesGithubCacheKey,
  executiveSupportersCacheKey,
  getAllPollsCacheKey,
  getPollTallyCacheKey,
  githubExecutivesCacheKey
} from 'modules/cache/constants/cache-keys';
import { invalidateCache } from 'modules/cache/invalidateCache';
import { toast } from 'react-toastify';

const DashboardPage = (): React.ReactElement => {
  const { network } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [pollId, setPollId] = useState('');
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  const invalidate = async (cacheKey: string) => {
    setLoading(true);
    try {
      await invalidateCache(cacheKey, password, network);
      setLoading(false);
      toast.success(`Cache ${cacheKey} cleared`);
    } catch (e) {
      setLoading(false);
      if (e.toString().includes('Unauthorized')) {
        toast.error('Unauthorized');
      } else {
        toast.error('Error invalidating cache');
      }
    }
  };

  const logIn = async () => {
    if (!password) {
      toast.error('Invalid password');
      return;
    }

    setLoading(true);
    try {
      await fetchJson('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password
        })
      });
      setLoading(false);
      toast.success('Authorization successful');
      setSignedIn(true);
    } catch (e) {
      setLoading(false);
      toast.error('Invalid password');
    }
  };
  return (
    <PrimaryLayout sx={{ maxWidth: 'page' }}>
      <HeadComponent title="Dashboard" />
      <Stack gap={3}>
        <Heading>Dashboard</Heading>
        {!signedIn && (
          <Card>
            <Text as="h3">Enter Password</Text>
            <Flex sx={{ mt: 3 }}>
              <Box sx={{ mr: 2 }}>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </Box>
              <Button onClick={logIn}>Submit</Button>
            </Flex>
          </Card>
        )}
        {signedIn && (
          <Card>
            <ErrorBoundary componentName="Cache invalidation">
              <Text as="h3">Invalidate cache</Text>
              {loading && <Box>Clearing selected cache...</Box>}
              <Flex sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ m: 3 }}>
                  <Button onClick={() => invalidate(getAllPollsCacheKey())} disabled={loading}>
                    All polls
                  </Button>
                </Box>
                <Box sx={{ m: 3 }}>
                  <Button onClick={() => invalidate(executiveSupportersCacheKey)} disabled={loading}>
                    Executive supporters
                  </Button>
                </Box>
                <Box sx={{ m: 3 }}>
                  <Button onClick={() => invalidate(githubExecutivesCacheKey)} disabled={loading}>
                    Executives from GitHub
                  </Button>
                </Box>
                <Box sx={{ m: 3 }}>
                  <Button
                    onClick={() => {
                      invalidate(delegatesGithubCacheKey);
                      invalidate(allDelegatesCacheKey);
                    }}
                    disabled={loading}
                  >
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
                    onClick={() => invalidate(getPollTallyCacheKey(parseInt(pollId)))}
                    disabled={loading}
                    sx={{ minWidth: 150 }}
                  >
                    Tally by poll ID
                  </Button>
                </Flex>
              </Flex>
            </ErrorBoundary>
          </Card>
        )}
      </Stack>
    </PrimaryLayout>
  );
};

export default DashboardPage;
