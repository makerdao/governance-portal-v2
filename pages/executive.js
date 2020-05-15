import Link from 'next/link';
import { NavLink, Heading } from 'theme-ui';

import { getExecutiveProposals } from '../lib/api';
import { getNetwork } from '../lib/maker';
import PrimaryLayout from '../components/PrimaryLayout';

export default function Executive({ proposals = [] } = {}) {
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
}

export async function getStaticProps() {
  const proposals = await getExecutiveProposals();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals
    }
  };
}
