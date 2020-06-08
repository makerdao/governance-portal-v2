import { useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import { Heading, Container, Text, Box, Image, Flex, Card } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';

import { Global } from '@emotion/core';
import getMaker, { isDefaultNetwork } from '../lib/maker';
import { getPolls, getExecutiveProposals, getPostsAndPhotos } from '../lib/api';
import PrimaryLayout from '../components/layouts/Primary';
import SystemStats from '../components/landing/SystemStats';
import PollCard from '../components/polling/PollCard';
import ExecutiveCard from '../components/executive/ExecutiveCard';
import IntroCard from '../components/landing/IntroCard';
import PollingIndicator from '../components/landing/PollIndicator';
import Proposal from '../types/proposal';
import Poll from '../types/poll';
import BlogPost from '../types/blogPost';

type Props = {
  proposals: Proposal[];
  polls: Poll[];
  blogPosts: BlogPost[];
};

const LandingPage = ({ proposals, polls, blogPosts }: Props) => {
  const recentPolls = useMemo(() => polls.slice(0, 4), [polls]);

  const { data: hat } = useSWR<string>(`/executive/hat`, () =>
    getMaker().then(maker => maker.service('chief').getHat())
  );

  return (
    <PrimaryLayout>
      <Global
        styles={theme => ({
          html: {
            backgroundRepeat: 'no-repeat',
            backgroundImage: `linear-gradient(${theme.colors.surface}, ${theme.colors.surface}),
            linear-gradient(${theme.colors.background}, ${theme.colors.background})`,
            backgroundSize: `100% 560px, 100% 100%`
          },
          body: {
            backgroundRepeat: 'inherit',
            backgroundImage: 'inherit',
            backgroundSize: 'inherit'
          }
        })}
      />

      <Head>
        <title>Maker Governance Portal</title>
      </Head>
      <Container>
        <Container
          as="section"
          sx={{
            textAlign: 'center'
          }}
        >
          <Box pt="6" mx="auto" sx={{ maxWidth: 9 }}>
            <Heading as="h1" sx={{ fontSize: [7, 8], color: '#231536' }}>
              Maker Governance
            </Heading>
            <Text
              mx="auto"
              mt="3"
              as="p"
              sx={{
                fontSize: [3, 5],
                color: 'primaryText',
                lineHeight: 'body'
              }}
            >
              Join a decentralized community protecting the integrity of the Maker Protocol through research,
              discussion, and on-chain voting.
            </Text>
          </Box>
        </Container>

        <PollingIndicator polls={polls} />

        <Container as="section" pb="5" sx={{ maxWidth: 11 }}>
          <SystemStats />
        </Container>
        <Flex sx={{ justifyContent: 'space-around', flexWrap: 'wrap', maxWidth: 11 }} mx="auto" mb="6">
          <IntroCard
            title="Introduction to Governance"
            linkText="Get started"
            icon={<Icon name='govIntro' size="4" />}
          >
            A guide to outlining the basics of getting started with voting.
          </IntroCard>
          <IntroCard
            title="Governance Forum"
            linkText="Go to forum"
            icon={<Icon name='govForum' size="4" />}
          >
            Get the latest updates and take part in current discussions.
          </IntroCard>
          <IntroCard
            title="Governance Calls"
            linkText="View gov calls"
            icon={<Icon name='govCalls' size="4" />}
          >
            Weekly calls to present research and coordinate around current issues.
          </IntroCard>
        </Flex>
        <Container
          pb="5"
          sx={{
            textAlign: 'center'
          }}
          as="section"
        >
          <Box mx="auto" sx={{ maxWidth: 9 }}>
            <Heading as="h2" mb="3">
              Executive Votes
            </Heading>
            <Text mx="auto" as="p" sx={{ fontSize: [3, 5], color: 'primaryText', lineHeight: 'body' }}>
              Executive Votes are conducted to make changes to the system. The governing proposal represents
              the current state of the system.
            </Text>
          </Box>
          <Box mx="auto" sx={{ textAlign: 'left', maxWidth: 10 }}>
            {proposals.map(proposal => (
              <ExecutiveCard
                isHat={hat ? hat.toLowerCase() === proposal.source.toLowerCase() : false}
                key={proposal.key}
                proposal={proposal}
              />
            ))}
          </Box>
        </Container>

        <Container
          as="section"
          sx={{
            textAlign: 'center'
          }}
        >
          <Box mx="auto" sx={{ maxWidth: 9 }}>
            <Heading as="h2">Polling Votes</Heading>
            <Text mx="auto" mt="3" as="p" sx={{ fontSize: [3, 5], color: '#434358', lineHeight: 'body' }}>
              Polls are conducted to establish a rough consensus of community sentiment before Executive Votes
              are conducted.
            </Text>
          </Box>
          <Box mx="auto" sx={{ textAlign: 'left', maxWidth: 10 }}>
            <Container py="4">
              {recentPolls.map(poll => (
                <PollCard key={poll.pollId} poll={poll} />
              ))}
            </Container>
          </Box>
        </Container>

        <Container
          mt="4"
          p="5"
          as="section"
          sx={{
            textAlign: 'center',
            backgroundColor: 'rgba(209, 222, 230, 0.14)'
          }}
        >
          <Heading as="h2" mb="4" mt="3">
            Recent Governance Blog Posts
          </Heading>
          <Box>
            <Flex sx={{ justifyContent: 'center' }} mb="5" mt="5">
              {blogPosts
                ? blogPosts.map(post => (
                    <Card
                      key={post.title}
                      mx={'20px'}
                      sx={{ width: ['100%', '20vw'], borderRadius: 'medium' }}
                      p={'0'}
                    >
                      <Image
                        src={post.photoHref}
                        sx={{
                          objectFit: 'cover',
                          height: ['100px', '20vw'],
                          width: '100%',
                          backgroundColor: 'silver'
                        }}
                      />

                      <Text
                        p={3}
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: 3,
                          color: '#231536',
                          textAlign: 'left'
                        }}
                      >
                        {post.title}
                      </Text>
                      <Text px={3} pb={3} sx={{ textAlign: 'left' }}>
                        {new Date(post.date).toLocaleString('default', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </Card>
                  ))
                : 'loading...'}
            </Flex>
          </Box>
        </Container>
      </Container>
    </PrimaryLayout>
  );
};

export default ({ proposals, polls, blogPosts }) => {
  // fetch polls & proposals at run-time if on any network other than the default
  const [_polls, _setPolls] = useState<Poll[]>([]);
  const [_proposals, _setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      setLoading(true);
      Promise.all([getPolls(), getExecutiveProposals()]).then(([polls, proposals]) => {
        _setPolls(polls);
        _setProposals(proposals);
        setLoading(false);
      });
    }
  }, []);

  return (
    <LandingPage
      proposals={isDefaultNetwork() ? proposals : _proposals}
      polls={isDefaultNetwork() ? polls : _polls}
      blogPosts={blogPosts}
    />
  );
};

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
