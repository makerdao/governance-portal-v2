import React from 'react';
import Head from 'next/head';
import { Heading, NavLink, Card, Text } from 'theme-ui';
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
        <title>Governance Portal V2</title>
      </Head>

      <Heading as="h1">Governance Portal V2</Heading>
      {data ? (
        <Card>
          <Text>Dai Savings Rate: {savingsRate.toFixed(2)}</Text>
          <Text>Total Dai: {bigNumberKFormat(totalDaiSupply)}</Text>
          <Text>Dai Debt Celing: {debtCeiling.toLocaleString()}</Text>
        </Card>
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
          <NavLink>{proposal.key}</NavLink>
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
