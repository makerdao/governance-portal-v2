/** @jsx jsx */
import { useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { Heading, Container, Grid, Text, Flex, Badge, jsx } from 'theme-ui';
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
import ExecutiveIndicator from '../components/index/ExecutiveIndicator';
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
          backgroundSize: ['cover', 'contain'],
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <PrimaryLayout sx={{ maxWidth: 'page' }}>
        <Flex sx={{ justifyContent: 'center' }}>
          <Badge
            variant="primary"
            sx={{
              textTransform: 'none',
              textAlign: 'center',
              borderColor: '#FDC134',
              borderRadius: '50px',
              width: '1020px',
              whiteSpace: 'normal',
              fontWeight: 'normal',
              fontSize: [1, 2],
              py: 2,
              px: [3, 4],
              mt: ['-10px', '-25px']
            }}
          >
            <Text sx={{ display: ['block', 'none'] }}>
              Welcome to the new Vote Portal. The legacy site can still be reached at{' '}
              <Link href="//v1.vote.makerdao.com">
                <a>v1.vote.makerdao.com</a>
              </Link>
              .
            </Text>
            <Text sx={{ display: ['none', 'block'] }}>
              Welcome to the new Vote Portal, featuring easier access to information, batched poll voting,
              executive voting comments, and on-chain effects. For questions visit{' '}
              <Link href="//chat.makerdao.com/channel/governance-and-risk">
                <a>Rocket Chat</a>
              </Link>
              . The legacy Vote Portal can still be reached at{' '}
              <Link href="//v1.vote.makerdao.com">
                <a>v1.vote.makerdao.com</a>
              </Link>
              .
            </Text>
          </Badge>
        </Flex>
        <Flex sx={{ justifyContent: 'center', mt: 5 }}>
          <Badge
            variant="primary"
            sx={{
              textTransform: 'none',
              textAlign: 'center',
              color: '#AE3C4B',
              borderColor: '#AE3C4B',
              borderRadius: '50px',
              width: '1020px',
              whiteSpace: 'normal',
              fontWeight: 'bold',
              fontSize: [1, 2],
              py: 2,
              px: [3, 4],
              mt: ['-10px', '-25px']
            }}
          >
            <Text sx={{ display: ['block', 'none'] }}>
              We are currently experiencing issues with Infura when connecting with Metamask. If you are using
              Metamask, please create a Custom RPC, you can see how to{' '}
              <Link href="https://www.notion.so/makerdao/How-to-connect-MetaMask-to-a-Custom-RPC-da53e6f2d1f54fb7abf38decc645a80c">
                <a target="_blank">here</a>
              </Link>
              .
            </Text>
            <Text sx={{ display: ['none', 'block'] }}>
              We are currently experiencing issues with Infura when connecting with Metamask. If you are using
              Metamask, please create a Custom RPC, you can see how to{' '}
              <Link href="https://www.notion.so/makerdao/How-to-connect-MetaMask-to-a-Custom-RPC-da53e6f2d1f54fb7abf38decc645a80c">
                <a target="_blank">here</a>
              </Link>
            </Text>
          </Badge>
        </Flex>
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
                      fontWeight: 500,
                      fontSize: [3, 5],
                      px: [3, 'inherit']
                    }}
                  >
                    Join a decentralized community protecting the integrity of the Maker Protocol through
                    research, discussion, and on-chain voting.
                  </Text>
                  <Flex
                    sx={{ flexDirection: ['column', 'row'], width: ['100%', '85%'], alignSelf: 'center' }}
                  >
                    <PollingIndicator polls={polls} sx={{ mb: [2, 0] }} />
                    <ExecutiveIndicator proposals={proposals} hat={hat} sx={{ mt: [2, 0] }} />
                  </Flex>
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
                linkDest="https://community-development.makerdao.com/learn/governance/participate"
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
                  borderRadius: 'small',
                  height: '100%',
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
  const [polls, setPolls] = useState<Poll[]>(prefetchedPolls);
  const [proposals, setProposals] = useState<CMSProposal[]>(prefetchedProposals);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (getNetwork() === 'testnet') {
      initTestchainPolls(); // this is async but we don't need to await
    }
    if (!isDefaultNetwork() && (!polls || !proposals)) {
      Promise.all([getPolls(), getExecutiveProposals()])
        .then(([polls, proposals]) => {
          setPolls(polls);
          setProposals(proposals);
        })
        .catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && (!polls || !proposals))
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return <LandingPage proposals={proposals} polls={polls} blogPosts={blogPosts} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch polls, proposals, blog posts at build-time
  const [proposals, polls, blogPosts] = await Promise.all([
    getExecutiveProposals(),
    getPolls(),
    getPostsAndPhotos()
  ]);

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals,
      polls,
      blogPosts
    }
  };
};
