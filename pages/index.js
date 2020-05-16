import { useMemo, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@makerdao/dai-ui-icons';
import {
  Heading,
  NavLink,
  Container,
  Flex,
  Text,
  Box,
  Link as ExternalLink
} from 'theme-ui';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';

import { Global } from '@emotion/core';
import Skeleton from 'react-loading-skeleton';
import getMaker, { getNetwork, DAI } from '../lib/maker';
import { bigNumberKFormat } from '../lib/utils';
import { getPolls, getExecutiveProposals } from '../lib/api';
import PrimaryLayout from '../components/PrimaryLayout';

async function getSystemStats() {
  const maker = await getMaker();
  return Promise.all([
    maker.service('mcd:savings').getYearlyRate(),
    maker.getToken(DAI).totalSupply(),
    maker.service('mcd:systemData').getSystemWideDebtCeiling()
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getSystemStats().then(stats => {
    mutate('/system-stats', stats, false);
  });
}

export default function Index({ proposals = [], polls = [] } = {}) {
  const network = getNetwork();
  const { data } = useSWR(`/system-stats`, getSystemStats);

  const [savingsRate, totalDaiSupply, debtCeiling] = data || [];

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
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text pb="2" sx={{ fontSize: 6 }}>
              System Stats
            </Text>
            <ExternalLink href="https://daistats.com/" target="_blank">
              <Flex sx={{ alignItems: 'center' }}>
                <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
                  See all system stats
                  <Icon
                    ml="2"
                    name="chevron_right"
                    size="2"
                    sx={{ color: 'mutedAlt' }}
                  />
                </Text>
              </Flex>
            </ExternalLink>
          </Flex>

          <Flex
            mx="auto"
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
                  {data ? `${savingsRate.toFixed(2)}%` : <Skeleton />}
                </Text>
              </div>
              <div>
                <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Total Dai</Text>
                <Text mt="2" variant="h2">
                  {data ? bigNumberKFormat(totalDaiSupply) : <Skeleton />}
                </Text>
              </div>
              <div>
                <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>
                  Dai Debt Celing
                </Text>
                <Text mt="2" variant="h2">
                  {data ? debtCeiling.toLocaleString() : <Skeleton />}
                </Text>
              </div>
            </Flex>
          </Flex>
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
