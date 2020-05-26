import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';

import PrimaryLayout from '../../components/PrimaryLayout';
import { getExecutiveProposal, getExecutiveProposals } from '../../lib/api';
import { isDefaultNetwork } from '../../lib/maker';
import Proposal from '../../types/proposal';

type Props = {
  proposal: Proposal;
  loading: boolean;
};

const ExecutiveProposal: React.FC<Props> = ({ proposal, loading }) => {
  if (loading)
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  if (!proposal?.key) {
    return (
      <ErrorPage
        statusCode={404}
        title="Executive proposal could not be found"
      />
    );
  }

  return (
    <PrimaryLayout>
      <div dangerouslySetInnerHTML={{ __html: proposal.content }} />
    </PrimaryLayout>
  );
};

export async function getStaticProps({ params }) {
  // fetch proposal contents at build-time if on the default network
  const proposal = await getExecutiveProposal(params['proposal-id'], {
    useCache: true
  });

  return {
    props: {
      proposal
    }
  };
}

export default ({ proposal }) => {
  const [_proposal, _setProposal] = useState();
  const [loading, setLoading] = useState(false);
  const { query, isFallback } = useRouter();

  // fetch proposal contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      setLoading(true);
      getExecutiveProposal(query['proposal-id'], {
        useCache: true
      }).then(proposal => {
        setLoading(false);
        _setProposal(proposal);
      });
    }
  }, []);
  return (
    <ExecutiveProposal
      loading={loading || isFallback}
      proposal={isDefaultNetwork() ? proposal : _proposal}
    />
  );
};

export async function getStaticPaths() {
  const proposals = await getExecutiveProposals();
  const paths = proposals.map(proposal => `/executive/${proposal.key}`);

  return {
    paths,
    fallback: true
  };
}
