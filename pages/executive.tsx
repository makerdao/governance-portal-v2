import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavLink, Heading } from 'theme-ui';
import ErrorPage from 'next/error';

import { getExecutiveProposals } from '../lib/api';
import { getNetwork, isDefaultNetwork } from '../lib/maker';
import PrimaryLayout from '../components/layouts/Primary';
import Proposal from '../types/proposal';

type Props = {
  proposals: Proposal[];
};

const ExecutiveOverview = ({ proposals }: Props) => {
  const network = getNetwork();
  return (
    <PrimaryLayout>
      <Heading as="h1">Executive Proposals</Heading>

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
          <NavLink>{proposal.key}</NavLink>
        </Link>
      ))}
    </PrimaryLayout>
  );
};

export default function ExecutiveOverviewPage({ proposals: prefetchedProposals }: Props) {
  const [_proposals, _setProposals] = useState<Proposal[]>();
  const [error, setError] = useState<string>();

  // fetch proposals at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getExecutiveProposals()
        .then(_setProposals)
        .catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && !_proposals)
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return (
    <ExecutiveOverview proposals={isDefaultNetwork() ? prefetchedProposals : (_proposals as Proposal[])} />
  );
}

export async function getStaticProps() {
  // fetch proposals at build-time if on the default network
  const proposals = await getExecutiveProposals();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals
    }
  };
}
