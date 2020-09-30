/** @jsx jsx */
import { useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { Heading, Container, Grid, Text, jsx } from 'theme-ui';
import useSWR from 'swr';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { Global } from '@emotion/core';

import getMaker, { isDefaultNetwork, getNetwork } from '../lib/maker';
import { getPolls, getExecutiveProposals, getPostsAndPhotos } from '../lib/api';
import PrimaryLayout from '../components/layouts/Primary';
import Stack from '../components/layouts/Stack';
import SystemStats from '../components/index/SystemStats';
import PollPreviewCard from '../components/index/PollPreviewCard';
import ExecutiveCard from '../components/index/ExecutiveCard';
import IntroCard from '../components/index/IntroCard';
import PollingIndicator from '../components/index/PollingIndicator';
import BlogPostCard from '../components/index/BlogPostCard';
import { CMSProposal } from '../types/proposal';
import Poll from '../types/poll';
import BlogPost from '../types/blogPost';
import { initTestchainPolls } from '../lib/utils';
import { isActivePoll } from '../lib/utils';

type Props = {
  proposals: CMSProposal[];
  polls: Poll[];
  blogPosts: BlogPost[];
};

const LandingPage = ({ proposals, polls, blogPosts }: Props) => {
  const recentPolls = useMemo(() => polls.slice(0, 4), [polls]);
  const activePolls = useMemo(() => polls.filter(poll => isActivePoll(poll)), [polls]);

  const { data: hat } = useSWR<string>('/executive/hat', () =>
    getMaker().then(maker => maker.service('chief').getHat())
  );

  return (
    <div>
      <Head>
        <title>Maker Governance</title>
      </Head>
      <div
        sx={{
          top: 0,
          left: 0,
          pt: '100%',
          width: '100vw',
          zIndex: -1,
          position: 'absolute',
          backgroundImage: 'url(/assets/heroVisual.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <PrimaryLayout sx={{ maxWidth: 'page' }}>
        <Stack gap={[5, 6]}>
          <section>
            <Stack gap={[4, 6]}>
              <Container pt={[4, 6]} sx={{ maxWidth: 'title', textAlign: 'center' }}>
                <Stack gap={3}>
                  <Heading as="h1" sx={{ color: 'text', fontSize: [7, 8] }}>
                    Maker Governance
                  </Heading>
                  <Text as="p" mb="3" sx={{ color: 'textSecondary', fontSize: [3, 5], px: [3, 'inherit'] }}>
                    Join a decentralized community protecting the integrity of the Maker Protocol through
                    research, discussion, and on-chain voting.
                  </Text>
                  <PollingIndicator polls={polls} />
                </Stack>
              </Container>
            </Stack>
          </section>

          <section>
            <SystemStats />
          </section>

          <section>
            <Grid gap={[4, 5]} sx={{ px: [2, 0] }} columns={[1, 3]}>
              <IntroCard
                title="Intro to Governance"
                linkDest="https://community-development.makerdao.com/onboarding/voter-onboarding"
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
                linkDest="https://community-development.makerdao.com/governance/governance-tools"
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
                <Stack>
                  {recentPolls.map(poll => (
                    <PollPreviewCard key={poll.pollId} poll={poll} />
                  ))}
                </Stack>
                {activePolls.length > 4 && (
                  <Link href={{ pathname: '/polling', query: { network: getNetwork() } }}>
                    <Text sx={{ color: 'primary', mt: 3, cursor: 'pointer' }}>View all polls</Text>
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
                  height: '85%',
                  width: '100%',
                  position: 'absolute',
                  zIndex: -1,
                  mt: t => `-${t.space[5]}px`,
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
        styles={theme => ({
          body: {
            backgroundColor: theme.colors.surface
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
  const [_polls, _setPolls] = useState<Poll[]>();
  const [_proposals, _setProposals] = useState<CMSProposal[]>();
  const [error, setError] = useState<string>();

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    async function initTestchain() {
      if (getNetwork() === 'testnet') await initTestchainPolls();
    }
    initTestchain();
    if (!isDefaultNetwork()) {
      Promise.all([getPolls(), getExecutiveProposals()])
        .then(([polls, proposals]) => {
          _setPolls(polls);
          _setProposals(proposals);
        })
        .catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && (!_polls || !_proposals))
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return (
    <LandingPage
      proposals={isDefaultNetwork() ? prefetchedProposals : (_proposals as CMSProposal[])}
      polls={isDefaultNetwork() ? prefetchedPolls : (_polls as Poll[])}
      blogPosts={blogPosts}
    />
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch polls, proposals, blog posts at build-time
  const [proposals, polls, blogPosts] = await Promise.all([
    getExecutiveProposals(),
    getPolls(),
    getPostsAndPhotos()
  ]);

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals,
      polls,
      blogPosts
    }
  };
};
