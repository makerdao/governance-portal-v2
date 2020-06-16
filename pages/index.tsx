/** @jsx jsx */
import { useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import { Heading, Container, Flex, Text, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';
import ErrorPage from 'next/error';
import { Global } from '@emotion/core';

import getMaker, { isDefaultNetwork } from '../lib/maker';
import { getPolls, getExecutiveProposals, getPostsAndPhotos } from '../lib/api';
import PrimaryLayout from '../components/layouts/Primary';
import Stack from '../components/layouts/Stack';
import Wrap from '../components/layouts/Wrap';
import SystemStats from '../components/index/SystemStats';
import PollPreviewCard from '../components/index/PollPreviewCard';
import ExecutiveCard from '../components/index/ExecutiveCard';
import IntroCard from '../components/index/IntroCard';
import PollingIndicator from '../components/index/PollingIndicator';
import BlogPostCard from '../components/index/BlogPostCard';
import Proposal from '../types/proposal';
import Poll from '../types/poll';
import BlogPost from '../types/blogPost';

type Props = {
  proposals: Proposal[];
  polls: Poll[];
  blogPosts: BlogPost[];
};

const LandingPage = ({ proposals, polls, blogPosts }: Props) => {
  const recentPolls = useMemo(
    () => polls.filter(poll => new Date(poll.startDate).getTime() <= Date.now()).slice(0, 4),
    [polls]
  );

  const { data: hat } = useSWR<string>(`/executive/hat`, () =>
    getMaker().then(maker => maker.service('chief').getHat())
  );

  return (
    <div
      sx={{
        background: 'url(/assets/heroVisualTransparent.png) no-repeat',
        backgroundSize: '100%',
        backgroundPosition: '0 0'
      }}
    >
      <Head>
        <title>Maker Governance Portal</title>
      </Head>

      <PrimaryLayout>
        <Stack gap={6}>
          <section>
            <Stack gap={5}>
              <Container
                pt={[4, 6]}
                sx={{
                  maxWidth: 'title',
                  textAlign: 'center'
                }}
              >
                <Stack gap={3}>
                  <Heading as="h1" sx={{ fontSize: [7, 8] }}>
                    Maker Governance
                  </Heading>
                  <Text
                    as="p"
                    sx={{
                      fontSize: [3, 5],
                      px: [4, 'inherit']
                    }}
                  >
                    Join a decentralized community protecting the integrity of the Maker Protocol through
                    research, discussion, and on-chain voting.
                  </Text>
                </Stack>
              </Container>

              <PollingIndicator polls={polls} />
            </Stack>
          </section>

          <section>
            <SystemStats />
          </section>

          <section>
            <Wrap justifyContent="space-around">
              <IntroCard
                title="Introduction to Governance"
                linkText="Get started"
                linkDest="https://community-development.makerdao.com/onboarding/voter-onboarding"
                icon={<Icon name="govIntro" size="5" />}
              >
                A guide to outlining the basics of getting started with voting.
              </IntroCard>
              <IntroCard
                title="Governance Forum"
                linkText="Go to forum"
                linkDest="https://forum.makerdao.com/c/governance/"
                icon={<Icon name="govForum" size="5" />}
              >
                Get the latest updates and take part in current discussions.
              </IntroCard>
              <IntroCard
                title="Governance Calls"
                linkText="View gov calls"
                linkDest="https://community-development.makerdao.com/governance/governance-and-risk-meetings"
                icon={<Icon name="govCalls" size="5" />}
              >
                Weekly calls to present research and coordinate around current issues.
              </IntroCard>
            </Wrap>
          </section>

          <section>
            <Stack>
              <Container sx={{ textAlign: 'center', maxWidth: 'title' }}>
                <Stack gap={3}>
                  <Heading as="h2">Executive Votes</Heading>
                  <Text as="p" sx={{ px: [4, 'inherit'], fontSize: [3, 5] }}>
                    Executive Votes are conducted to make changes to the system. The governing proposal
                    represents the current state of the system.
                  </Text>
                </Stack>
              </Container>

              <Container sx={{ textAlign: 'left', maxWidth: 'column' }}>
                <Stack>
                  {proposals.map(proposal => (
                    <ExecutiveCard
                      isHat={hat ? hat.toLowerCase() === proposal.source.toLowerCase() : false}
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
                <Stack gap={3}>
                  <Heading as="h2">Polling Votes</Heading>
                  <Text as="p" sx={{ px: [4, 'inherit'], fontSize: [3, 5] }}>
                    Polls are conducted to establish a rough consensus of community sentiment before Executive
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
                <Wrap breakpoints={[true, false]} sx={{ px: [3, 5] }}>
                  {blogPosts.map(post => (
                    <BlogPostCard key={post.link} blogPost={post} />
                  ))}
                </Wrap>
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

export default function Index({ proposals: prefetchedProposals, polls: prefetchedPolls, blogPosts }: Props) {
  // fetch polls & proposals at run-time if on any network other than the default
  const [_polls, _setPolls] = useState<Poll[]>();
  const [_proposals, _setProposals] = useState<Proposal[]>();
  const [error, setError] = useState<string>();

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
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
      proposals={isDefaultNetwork() ? prefetchedProposals : (_proposals as Proposal[])}
      polls={isDefaultNetwork() ? prefetchedPolls : (_polls as Poll[])}
      blogPosts={blogPosts}
    />
  );
}

export async function getStaticProps() {
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
}
