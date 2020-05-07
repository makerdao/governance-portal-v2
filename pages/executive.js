import React from 'react';
import Link from 'next/link';
import { NavLink, Heading } from 'theme-ui';

import fetchExecutiveProposals from '../lib/fetchExecutiveProposals';
import PrimaryLayout from '../components/PrimaryLayout';

export default function Executive({ proposals }) {
  return (
    <PrimaryLayout>
      <Heading as="h1">Executive Proposals</Heading>

      {proposals.map((proposal) => (
        <Link
          key={proposal.key}
          href="/executive/[proposal-id]"
          as={`/executive/${proposal.key}`}
        >
          <NavLink>{proposal.key}</NavLink>
        </Link>
      ))}
    </PrimaryLayout>
  );
}

export async function getStaticProps() {
  const proposals = await fetchExecutiveProposals();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals,
    },
  };
}
