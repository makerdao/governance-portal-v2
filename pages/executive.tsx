import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavLink, Heading } from '@theme-ui/components';

import { getExecutiveProposals } from '../lib/api';
import { getNetwork, isDefaultNetwork } from '../lib/maker';
import PrimaryLayout from '../components/PrimaryLayout';
import Proposal from '../types/proposal';

type Props = {
  proposals: Proposal[];
};

const ExecutiveOverview: React.FC<Props> = ({ proposals }) => {
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

export default ({ proposals }) => {
  const [_proposals, _setProposals] = useState([]);

  // fetch proposals at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getExecutiveProposals({ useCache: true }).then(proposals =>
        _setProposals(proposals)
      );
    }
  }, []);

  return (
    <ExecutiveOverview
      proposals={isDefaultNetwork() ? proposals : _proposals}
    />
  );
};

export async function getStaticProps() {
  // fetch proposals at build-time if on the default network
  const proposals = await getExecutiveProposals({ useCache: true });

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals
    }
  };
}
