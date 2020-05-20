import { useMemo } from 'react';
import Head from 'next/head';
import {
  Heading,
  NavLink,
  Container,
  Text,
  Box,
  Flex,
  Badge,
  Button
} from 'theme-ui';
import useSWR from 'swr';
import Link from 'next/link';

import { Global } from '@emotion/core';
import { getNetwork, isDefaultNetwork } from '../lib/maker';
import { getPolls, getExecutiveProposals } from '../lib/api';
import PrimaryLayout from '../components/PrimaryLayout';
import SystemStats from '../components/SystemStats';

export default ({ proposals = [], polls = [] } = {}) => {
  // fetch polls & proposals at run-time if on any network other than the default
  const { data: _polls } = useSWR(
    isDefaultNetwork() ? null : `/polling/polls`,
    getPolls,
    { refreshInterval: 0 }
  );

  const { data: _proposals } = useSWR(
    isDefaultNetwork() ? null : `/executive/proposals`,
    getExecutiveProposals,
    { refreshInterval: 0 }
  );

  return (
    <Index
      proposals={isDefaultNetwork() ? proposals : _proposals}
      polls={isDefaultNetwork() ? polls : _polls}
    />
  );
};

function Index({ proposals = [], polls = [] } = {}) {
  const network = getNetwork();

  const activePolls = useMemo(
    () =>
      polls.filter(
        poll =>
          new Date(poll.startDate) <= new Date() &&
          new Date(poll.endDate) >= new Date()
      ),
    []
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
          <Box py="6" mx="auto" sx={{ maxWidth: 9 }}>
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

        <Container as="section" pb="5" sx={{ maxWidth: 11 }}>
          <SystemStats />
        </Container>

        <Container as="section">
          <Heading as="h2">Executive Votes</Heading>
          {proposals.map(proposal => (
            <Link
              key={proposal.key}
              href={{
                pathname: '/executive/[proposal-id]',
                query: { network }
              }}
              as={{
                pathname: `/executive/${proposal.key}`,
                query: { network }
              }}
            >
              <NavLink>{proposal.title}</NavLink>
            </Link>
          ))}
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
              {activePolls.map(poll => (
                <Flex
                  p="4"
                  mx="auto"
                  variant="cards.primary"
                  sx={{ boxShadow: 'faint', height: '210px' }}
                >
                  <Flex
                    sx={{
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text
                      sx={{
                        fontSize: [2, 3],
                        color: '#708390',
                        textTransform: 'uppercase'
                      }}
                    >
                      Posted{' '}
                      {new Date(poll.startDate).toLocaleString('default', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    <Link
                      key={poll.multiHash}
                      href={{
                        pathname: '/polling/[poll-hash]',
                        query: { network }
                      }}
                      as={{
                        pathname: `/polling/${poll.multiHash}`,
                        query: { network }
                      }}
                    >
                      <Text
                        sx={{
                          fontSize: [3, 4],
                          color: '#231536'
                        }}
                      >
                        {poll.title}
                      </Text>
                    </Link>
                    <Text
                      sx={{
                        fontSize: [3, 4],
                        color: '#434358'
                      }}
                    >
                      {poll.summary}
                    </Text>
                    <Flex sx={{ justifyContent: 'space-around' }}>
                      <Link
                        key={poll.multiHash}
                        href={{
                          pathname: '/polling/[poll-hash]',
                          query: { network }
                        }}
                        as={{
                          pathname: `/polling/${poll.multiHash}`,
                          query: { network }
                        }}
                      >
                        <NavLink variant="buttons.outline">
                          View Proposal
                        </NavLink>
                      </Link>
                      <Badge
                        variant="primary"
                        sx={{ textTransform: 'uppercase', alignSelf: 'center' }}
                      >
                        Leading Option:{' '}
                        {'Increase Stability fee by 1.50% to 7.50%'}
                      </Badge>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </Container>
          </Box>
        </Container>
      </Container>
    </PrimaryLayout>
  );
}

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
