import { useMemo, useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { Heading, Container, Grid, Text, Flex, useColorMode, Box, Button } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { Global } from '@emotion/core';
import { fetchJson } from 'lib/fetchJson';

import { isActivePoll } from 'modules/polling/helpers/utils';
import { useHat } from 'modules/executive/hooks/useHat';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import SystemStats from 'modules/home/components/SystemStats';
import ExecutiveCard from 'modules/home/components/ExecutiveCard';
import IntroCard from 'modules/home/components/IntroCard';
import PollingIndicator from 'modules/home/components/PollingIndicator';
import ExecutiveIndicator from 'modules/home/components/ExecutiveIndicator';
import BlogPostCard from 'modules/home/components/BlogPostCard';
import { CMSProposal } from 'modules/executive/types';
import { Poll } from 'modules/polling/types';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { fetchBlogPosts } from 'modules/blog/api/fetchBlogPosts';
import { BlogPost } from 'modules/blog/types/blogPost';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import VideoModal from 'modules/app/components/VideoModal';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';

type Props = {
  proposals: CMSProposal[];
  polls: Poll[];
  blogPosts: BlogPost[];
};

const LandingPage = ({ proposals, polls, blogPosts }: Props) => {
  const [mode] = useColorMode();
  const recentPolls = useMemo(() => polls.slice(0, 4), [polls]);
  const activePolls = useMemo(() => polls.filter(poll => isActivePoll(poll)), [polls]);
  const [videoOpen, setVideoOpen] = useState(false);

  const [backgroundImage, setBackroundImage] = useState('url(/assets/heroVisual.svg');

  const { data: hat } = useHat();

  useEffect(() => {
    setBackroundImage(mode === 'dark' ? 'url(/assets/heroVisualDark.svg)' : 'url(/assets/heroVisual.svg)');
  }, [mode]);

  return (
    <div>
      <div
        sx={{
          top: 0,
          left: 0,
          pt: '100%',
          width: '100vw',
          zIndex: -1,
          position: 'absolute',
          backgroundImage,
          backgroundSize: ['cover', 'contain'],
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <VideoModal isOpen={videoOpen} onDismiss={() => setVideoOpen(false)} />
      <PrimaryLayout sx={{ maxWidth: 'page' }}>
        <Stack gap={[5, 6]}>
          <section>
            <Stack gap={[4, 6]}>
              <Container pt={4} sx={{ maxWidth: 'title', textAlign: 'center' }}>
                <Stack gap={3}>
                  <Heading as="h1" sx={{ color: 'text', fontSize: [7, 8] }}>
                    Maker Governance
                  </Heading>
                  <Text
                    as="p"
                    mb="3"
                    sx={{
                      color: 'text',
                      opacity: '0.7',
                      fontWeight: 'semiBold',
                      fontSize: [3, 5],
                      px: [3, 'inherit']
                    }}
                  >
                    Join a decentralized community protecting the integrity of the Maker Protocol through
                    research, discussion, and on-chain voting.
                  </Text>
                  <ErrorBoundary componentName="Last Polls and Executive">
                    <Flex
                      sx={{ flexDirection: ['column', 'row'], width: ['100%', '85%'], alignSelf: 'center' }}
                    >
                      <PollingIndicator polls={polls} sx={{ mb: [2, 0] }} />
                      <ExecutiveIndicator proposals={proposals} sx={{ mt: [2, 0] }} />
                    </Flex>
                  </ErrorBoundary>
                  <Box>
                    <Button
                      variant="outline"
                      sx={{ borderRadius: 'round' }}
                      onClick={() => setVideoOpen(true)}
                    >
                      <Flex sx={{ alignItems: 'center' }}>
                        <Icon sx={{ mr: 2 }} name="play" size={3} fill="#7e7e88" />
                        <Text>How to vote</Text>
                      </Flex>
                    </Button>
                  </Box>
                </Stack>
              </Container>
            </Stack>
          </section>

          <section>
            <ErrorBoundary componentName="System Stats">
              <SystemStats />
            </ErrorBoundary>
          </section>

          <section>
            <Grid gap={[4, 5]} sx={{ px: [2, 0] }} columns={[1, 3]}>
              <IntroCard
                title="Intro to Governance"
                linkDest="https://makerdao.world/learn/governance"
                icon="govIntro"
                sx={{
                  '&:hover': {
                    backgroundColor: '#FFC28608',
                    borderColor: '#FFC286CC'
                  }
                }}
              >
                A guide outlining the basics of getting started with Maker Governance.
              </IntroCard>
              <IntroCard
                title="Maker Forum"
                linkDest="https://forum.makerdao.com"
                icon="govForum"
                sx={{
                  '&:hover': {
                    backgroundColor: '#AFBBFF08',
                    borderColor: '#AFBBFFCC'
                  }
                }}
              >
                Get the latest updates and take part in current governance discussions.
              </IntroCard>
              <IntroCard
                title="Community Tools"
                linkDest="https://makerdao.world/learn/governance/participate"
                icon="govCalls"
                sx={{
                  '&:hover': {
                    backgroundColor: '#84CBC408',
                    borderColor: '#84CBC4CC'
                  }
                }}
              >
                Use tools from the community to stay informed on the state of the system.
              </IntroCard>
            </Grid>
          </section>

          <section>
            <Stack>
              <Container sx={{ textAlign: 'center', maxWidth: 'title' }}>
                <Stack gap={2}>
                  <Heading as="h2">Executive Votes</Heading>
                  <Text sx={{ fontWeight: 400, color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
                    Executive Votes are conducted to make changes to the protocol. The governing proposal
                    represents the current state of the system.
                  </Text>
                </Stack>
              </Container>

              <Container sx={{ textAlign: 'left', maxWidth: 'column' }}>
                <ErrorBoundary componentName="Executive Votes">
                  <Stack>
                    {proposals
                      .filter(proposal => proposal.active)
                      .map(proposal => (
                        <ExecutiveCard
                          isHat={hat ? hat.toLowerCase() === proposal.address.toLowerCase() : false}
                          key={proposal.key}
                          proposal={proposal}
                        />
                      ))}
                  </Stack>
                </ErrorBoundary>
              </Container>
            </Stack>
          </section>

          <section>
            <Stack>
              <Container sx={{ textAlign: 'center', maxWidth: 'title' }}>
                <Stack gap={2}>
                  <Heading as="h2">Polling Votes</Heading>
                  <Text as="p" sx={{ color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
                    Polls take place to establish a rough consensus of community sentiment before Executive
                    Votes are conducted.
                  </Text>
                </Stack>
              </Container>

              <Container sx={{ maxWidth: 'column' }}>
                <ErrorBoundary componentName="Recent Polls">
                  <Stack>
                    {recentPolls.map(poll => (
                      <PollOverviewCard key={poll.pollId} poll={poll} reviewPage={false} showVoting={false} />
                    ))}
                  </Stack>
                </ErrorBoundary>
                {activePolls.length > 4 && (
                  <Link href={{ pathname: '/polling' }}>
                    <Text as="p" sx={{ color: 'primary', mt: 3, cursor: 'pointer' }}>
                      View all polls
                    </Text>
                  </Link>
                )}
              </Container>
            </Stack>
          </section>

          <section sx={{ py: 5 }}>
            <Container
              sx={{
                textAlign: 'center',
                maxWidth: 'page',
                position: ['relative']
              }}
            >
              <div
                sx={{
                  borderRadius: 'small',
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                  zIndex: -1,
                  mt: t => `-${(t as any).space[5]}px`,
                  bg: 'background'
                }}
              />
              <Stack>
                <Heading as="h2">Recent Governance Blog Posts</Heading>
                <Grid gap={4} columns={[1, 3]} sx={{ px: [3, 4] }}>
                  {blogPosts.map(post => (
                    <BlogPostCard key={post.link} blogPost={post} />
                  ))}
                </Grid>
              </Stack>
            </Container>
          </section>
        </Stack>
      </PrimaryLayout>
      <Global
        /* react-loading-skeleton uses an outdated version of @emotion/core which causes incorrect type errors.
        see: https://github.com/emotion-js/emotion/issues/1800 */
        // @ts-ignore
        styles={() => ({
          body: {
            backgroundColor: 'transparent'
          },
          ':root': {
            background: theme => theme.colors.surface
          }
        })}
      />
    </div>
  );
};

export default function Index({
  proposals: prefetchedProposals,
  polls: prefetchedPolls,
  blogPosts
}: Props): JSX.Element {
  // fetch polls & proposals at run-time if on any network other than the default
  const [_polls, setPolls] = useState<Poll[]>();
  const [_proposals, setProposals] = useState<CMSProposal[]>();
  const [error, setError] = useState<string>();
  const { network } = useActiveWeb3React();

  useEffect(() => {
    if (!network) return;
    if (!isDefaultNetwork(network) && (!_polls || !_proposals)) {
      Promise.all([
        fetchJson(`/api/polling/all-polls?network=${network}`),
        fetchJson(`/api/executive?network=${network}`)
      ])
        .then(([pollsData, proposals]) => {
          setPolls(pollsData.polls);
          setProposals(proposals);
        })
        .catch(setError);
    }
  }, [network]);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork(network) && (!_polls || !_proposals))
    return (
      <PrimaryLayout>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );

  return (
    <LandingPage
      proposals={isDefaultNetwork(network) ? prefetchedProposals : (_proposals as CMSProposal[])}
      polls={isDefaultNetwork(network) ? prefetchedPolls : (_polls as Poll[])}
      blogPosts={blogPosts}
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch polls, proposals, blog posts at build-time
  const [proposals, pollsData, blogPosts] = await Promise.all([
    getExecutiveProposals(),
    getPolls(),
    fetchBlogPosts()
  ]);

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals,
      polls: pollsData.polls,
      blogPosts
    }
  };
};
