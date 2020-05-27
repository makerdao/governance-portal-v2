import { useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Heading,
  Container,
  Text,
  Box,
  Button,
  Image,
  Flex,
  Card
} from '@theme-ui/components';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';

import { Global } from '@emotion/core';
import getMaker, { isDefaultNetwork } from '../lib/maker';
import { getPolls, getExecutiveProposals, getPostsAndPhotos } from '../lib/api';
import PrimaryLayout from '../components/layouts/Primary';
import SystemStats from '../components/SystemStats';
import PollCard from '../components/PollCard';
import ExecutiveCard from '../components/ExecutiveCard';
import Proposal from '../types/proposal';
import Poll from '../types/poll';
import BlogPost from '../types/blogPost';

type Props = {
  proposals: Proposal[];
  polls: Poll[];
};

const LandingPage: React.FC<Props> = ({ proposals, polls }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>();
  const recentPolls = useMemo(() => polls.slice(0, 4), []);

  const { data: hat } = useSWR<string>(`/executive/hat`, () =>
    getMaker().then(maker => maker.service('chief').getHat())
  );

  useEffect(() => {
    getPostsAndPhotos().then(blogPosts => {
      setBlogPosts(blogPosts);
    });
  }, []);

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
                color: '#434358',
                lineHeight: 'body'
              }}
            >
              Join a decentralized community protecting the integrity of the
              Maker Protocol through research, discussion, and on-chain voting.
            </Text>
          </Box>
        </Container>
        <Box py="5" mx="auto" sx={{ maxWidth: 9, textAlign: 'center' }}>
          <Button
            variant="outline"
            sx={{
              borderRadius: 'round',
              bg: 'background',
              border: '1px solid',
              borderColor: 'secondary',
              color: '#434358',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                border: '1px solid #1AAB9B',
                borderRadius: 13,
                width: 26,
                height: 26,
                color: '#1AAB9B',
                marginRight: 20
              }}
            >
              {recentPolls.length}
            </span>
            New polling votes!
            <Icon
              name="chevron_right"
              color="#708390"
              size="2"
              sx={{ marginLeft: 20 }}
            />
          </Button>
        </Box>
        <Container as="section" pb="5" sx={{ maxWidth: 11 }}>
          <SystemStats />
        </Container>
        <Flex
          sx={{ justifyContent: 'space-around', maxWidth: 11 }}
          mx="auto"
          mb="6"
        >
          <Card sx={{ minWidth: 348, maxWidth: 348 }}>
            <Text
              sx={{
                fontSize: [3, 4],
                color: '#231536',
                textAlign: 'left'
              }}
              mb="m"
            >
              Introduction to Governance
            </Text>
            <Text
              sx={{
                fontSize: [3, 4],
                color: '#434358',
                opacity: 0.8,
                whiteSpace: 'initial'
              }}
            >
              A guide to outlining the basics of getting started with voting.
            </Text>
          </Card>
          <Card sx={{ minWidth: 348, maxWidth: 348 }}>
            <Text
              sx={{
                fontSize: [3, 4],
                color: '#231536',
                textAlign: 'left'
              }}
            >
              Governance Forum
            </Text>
            <Text
              sx={{
                fontSize: [3, 4],
                color: '#434358',
                opacity: 0.8,
                whiteSpace: 'initial'
              }}
            >
              Get the latest updates and take part in current discussions.
            </Text>
          </Card>
          <Card sx={{ minWidth: 348, maxWidth: 348 }}>
            <Text
              sx={{
                fontSize: [3, 4],
                color: '#231536',
                textAlign: 'left'
              }}
            >
              Governance Calls
            </Text>
            <Text
              sx={{
                fontSize: [3, 4],
                color: '#434358',
                opacity: 0.8,
                whiteSpace: 'initial'
              }}
            >
              Weekly calls to present research and coordinate around current
              issues.
            </Text>
          </Card>
        </Flex>
        <Container
          pb="5"
          sx={{
            textAlign: 'center'
          }}
          as="section"
        >
          <Box mx="auto" sx={{ maxWidth: 9 }}>
            <Heading as="h2">Executive Votes</Heading>
            <Text
              mx="auto"
              mt="3"
              as="p"
              sx={{ fontSize: [3, 5], color: '#434358', lineHeight: 'body' }}
            >
              Executive Votes are conducted to make changes to the system. The
              governing proposal represents the current state of the system.
            </Text>
          </Box>
          <Box mx="auto" sx={{ textAlign: 'left', maxWidth: 10 }}>
            {proposals.map(proposal => (
              <ExecutiveCard
                isHat={
                  hat && hat.toLowerCase() === proposal.source.toLowerCase()
                }
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
            <Text
              mx="auto"
              mt="3"
              as="p"
              sx={{ fontSize: [3, 5], color: '#434358', lineHeight: 'body' }}
            >
              Polls are conducted to establish a rough consensus of community
              sentiment before Executive Votes are conducted.
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
          as="section"
          sx={{
            textAlign: 'center'
          }}
        >
          <Heading as="h2" mb="3">
            Blog Posts
          </Heading>
          <Box>
            <Flex sx={{ justifyContent: 'center' }} mb="6">
              {blogPosts
                ? blogPosts.map(post => (
                    <Card
                      key={post.title}
                      mx={'20px'}
                      sx={{ width: ['100%', '25vw'], borderRadius: 'medium' }}
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

export default ({ proposals, polls }) => {
  // fetch polls & proposals at run-time if on any network other than the default
  const [_polls, _setPolls] = useState<Poll[]>([]);
  const [_proposals, _setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      setLoading(true);
      Promise.all([
        getPolls({ useCache: true }),
        getExecutiveProposals({ useCache: true })
      ]).then(([polls, proposals]) => {
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
    />
  );
};

export async function getStaticProps() {
  // fetch polls & proposals at build-time if on the default network
  const [proposals, polls] = await Promise.all([
    getExecutiveProposals(),
    getPolls()
  ]);

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals,
      polls
    }
  };
}
