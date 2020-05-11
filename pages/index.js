import React from 'react';
import Head from 'next/head';
import { Heading, NavLink, Container, Flex, Text, Box } from 'theme-ui';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';

import _maker, { DAI } from '../maker';
import { bigNumberKFormat } from '../lib/utils';
import fetchPolls from '../lib/fetchPolls';
import fetchExecutiveProposals from '../lib/fetchExecutiveProposals';
import PrimaryLayout from '../components/PrimaryLayout';

async function getSystemStats() {
  const maker = await _maker;
  return Promise.all([
    maker.service('mcd:savings').getYearlyRate(),
    maker.getToken(DAI).totalSupply(),
    maker.service('mcd:systemData').getSystemWideDebtCeiling(),
  ]);
}

// if we are on the browser trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getSystemStats().then((stats) => {
    mutate('/system-stats', stats, false);
  });
}

export default function Index({ proposals, polls }) {
  const { data } = useSWR('/system-stats', getSystemStats);

  const [savingsRate, totalDaiSupply, debtCeiling] = data || [];

  return (
    <PrimaryLayout>
      <Head>
        <title>Maker Governance Portal</title>
      </Head>
      <Container>
        <Container
          sx={{
            textAlign: 'center',
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
                lineHeight: 'body',
              }}
            >
              Join a decentralized community protecting the integrity of the
              Maker Protocol through research, discussion, and on-chain voting.
            </Text>
          </Box>
        </Container>

        {data ? (
          <Container pb="5">
            <Flex
              variant="cards.primary"
              sx={{ boxShadow: 'faint', height: '133px' }}
            >
              <Flex
                mx="4"
                my="auto"
                sx={{ width: '100%', justifyContent: 'space-between' }}
              >
                <div>
                  <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>
                    Dai Savings Rate
                  </Text>
                  <Text mt="2" variant="h2">
                    {savingsRate.toFixed(2)}%
                  </Text>
                </div>
                <div>
                  <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Total Dai</Text>
                  <Text mt="2" variant="h2">
                    {bigNumberKFormat(totalDaiSupply)}
                  </Text>
                </div>
                <div>
                  <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>
                    Dai Debt Celing
                  </Text>
                  <Text mt="2" variant="h2">
                    {debtCeiling.toLocaleString()}
                  </Text>
                </div>
              </Flex>
            </Flex>
          </Container>
        ) : (
          'Loading system stats…'
        )}

        <Heading as="h2">Executive Votes</Heading>
        {proposals.map((proposal) => (
          <Link
            key={proposal.key}
            href="/executive/[proposal-id]"
            as={`/executive/${proposal.key}`}
          >
            <NavLink>{proposal.title}</NavLink>
          </Link>
        ))}

        <Heading as="h2">Polling Votes</Heading>
        {polls.map((poll) => (
          <Link
            key={poll.multiHash}
            href="/polling/[poll-id]"
            as={`/polling/${poll.multiHash}`}
          >
            <NavLink>{poll.title}</NavLink>
          </Link>
        ))}
      </Container>
    </PrimaryLayout>
  );
}

export async function getStaticProps() {
  const proposals = await fetchExecutiveProposals();
  const polls = (await fetchPolls()).map((p) => ({
    title: p.title,
    summary: p.summary,
    multiHash: p.multiHash,
  }));

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals,
      polls,
    },
  };
}
