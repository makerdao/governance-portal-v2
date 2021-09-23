/** @jsx jsx */

import { useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { Heading, Container, Grid, Text, Flex, jsx, useColorMode } from 'theme-ui';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { Global } from '@emotion/core';
import { isDefaultNetwork, getNetwork, isTestnet } from 'lib/maker';
import { initTestchainPolls } from 'lib/utils';
import { fetchJson } from 'lib/fetchJson';

import { isActivePoll } from 'modules/polling/helpers/utils';
import { useHat } from 'lib/hooks';
import PrimaryLayout from 'components/layouts/Primary';
import Stack from 'components/layouts/Stack';
import SystemStats from 'components/index/SystemStats';
import PollPreviewCard from 'components/index/PollPreviewCard';
import ExecutiveCard from 'components/index/ExecutiveCard';
import IntroCard from 'components/index/IntroCard';
import PollingIndicator from 'components/index/PollingIndicator';
import ExecutiveIndicator from 'components/index/ExecutiveIndicator';
import BlogPostCard from 'components/index/BlogPostCard';
import { CMSProposal } from 'modules/executive/types';
import { Poll } from 'modules/polling/types';
import PageLoadingPlaceholder from 'components/PageLoadingPlaceholder';
import { fetchBlogPosts } from 'modules/blog/api/fetchBlogPosts';
import { BlogPost } from 'modules/blog/types/blogPost';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';

type Props = {
  proposals: CMSProposal[];
  polls: Poll[];
  blogPosts: BlogPost[];
};

const LandingPage = ({ proposals, polls, blogPosts }: Props) => {
  const [mode] = useColorMode();
  const recentPolls = useMemo(() => polls.slice(0, 4), [polls]);
  const activePolls = useMemo(() => polls.filter(poll => isActivePoll(poll)), [polls]);

  const [backgroundImage, setBackroundImage] = useState('url(/assets/heroVisual.svg');

  const { data: hat } = useHat();

  useEffect(() => {
    setBackroundImage(mode === 'dark' ? 'url(/assets/heroVisualDark.svg)' : 'url(/assets/heroVisual.svg)');
  }, [mode]);

  return (
    <div>
      <Head>
        <title>Maker Governance Voting Portal</title>
      </Head>
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
      <PrimaryLayout sx={{ maxWidth: 'page' }}>
        {/* <Flex sx={{ justifyContent: 'center' }}>
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
          > */}
        {/* <Text sx={{ display: ['block', 'none'] }}>
              Welcome to the new Vote Portal. The legacy site can still be reached at{' '}
              <Link href="//v1.vote.makerdao.com">
                <a>v1.vote.makerdao.com</a>
              </Link>
              .
            </Text> */}
        {/* <Text>
              MakerDAO is currently migrating to a new governance chief contract to prevent flashloans from
              being used in governance activities. Please withdraw from the old Chief, deposit your MKR in the
              new Chief contract, and vote on the new proposal on the Executive Voting page. For more
              information please refer to this{' '}
              <Link href="//blog.makerdao.com/maker-dschief-1-2-governance-security-update-requires-mkr-holder-actions/">
                <a sx={{ color: 'accentBlue' }}>blog</a>
              </Link>
              .
            </Text> */}
        {/* <Text sx={{ display: ['none', 'block'] }}>
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
            </Text> */}
        {/* </Badge>
        </Flex> */}
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
                  <Flex
                    sx={{ flexDirection: ['column', 'row'], width: ['100%', '85%'], alignSelf: 'center' }}
                  >
                    <PollingIndicator polls={polls} sx={{ mb: [2, 0] }} />
                    <ExecutiveIndicator proposals={proposals} sx={{ mt: [2, 0] }} />
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
  const [polls, setPolls] = useState<Poll[]>(prefetchedPolls);
  const [proposals, setProposals] = useState<CMSProposal[]>(prefetchedProposals);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (isTestnet()) {
      initTestchainPolls(); // this is async but we don't need to await
    }

    if (!isDefaultNetwork() && (!polls || !proposals)) {
      Promise.all([
        fetchJson(`/api/polling/all-polls?network=${getNetwork()}`),
        fetchJson(`/api/executive?network=${getNetwork()}`)
      ])
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
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );

  return <LandingPage proposals={proposals} polls={polls} blogPosts={blogPosts} />;
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch polls, proposals, blog posts at build-time

  const [proposals, polls, blogPosts] = await Promise.all([
    getExecutiveProposals(),
    getPolls(),
    fetchBlogPosts()
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
