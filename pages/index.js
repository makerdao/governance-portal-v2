import { useMemo } from 'react';
import Head from 'next/head';
import { Heading, NavLink, Container, Text, Box } from 'theme-ui';
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

        <Container as="section" pb="5" sx={{ maxWidth: 10 }}>
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

        <Container as="section">
          <Heading as="h2">Polling Votes</Heading>
          {activePolls.map(poll => (
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
              <NavLink>{poll.title}</NavLink>
            </Link>
          ))}
        </Container>
      </Container>
    </PrimaryLayout>
  );
}

export async function getStaticProps() {
  // fetch polls & proposals at build-time if on the default network
  const proposals = await getExecutiveProposals();
  const polls = (await getPolls()).map(p => ({
    title: p.title,
    summary: p.summary,
    multiHash: p.multiHash,
    startDate: p.startDate,
    endDate: p.endDate
  }));

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals,
      polls
    }
  };
}
