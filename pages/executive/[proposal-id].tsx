import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';

import PrimaryLayout from '../../components/layouts/Primary';
import { getExecutiveProposal, getExecutiveProposals } from '../../lib/api';
import { isDefaultNetwork } from '../../lib/maker';
import Proposal from '../../types/proposal';
import invariant from 'tiny-invariant';

type Props = {
  proposal: Proposal;
};

const ExecutiveProposalPage = ({ proposal }: Props) => {
  return (
    <PrimaryLayout>
      <div dangerouslySetInnerHTML={{ __html: proposal.content }} />
    </PrimaryLayout>
  );
};

// HOC to fetch the proposal depending on the network
export default ({ proposal: preFetchedProposal }: { proposal?: Proposal }) => {
  const [runtimeFetchedProposal, setRuntimeFetchedProposal] = useState<Proposal>();
  const [error, setError] = useState<string>();
  const { query, isFallback } = useRouter();

  // fetch proposal contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getExecutiveProposal(query['proposal-id'])
        .then(setRuntimeFetchedProposal)
        .catch(setError);
    }
  }, []);

  if (error || (isDefaultNetwork() && !isFallback && !preFetchedProposal?.key)) {
    return (
      <ErrorPage
        statusCode={404}
        title="Executive proposal either does not exist, or could not be fetched at this time"
      />
    );
  }

  if (isFallback || (!isDefaultNetwork() && !runtimeFetchedProposal))
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  const proposal = isDefaultNetwork() ? preFetchedProposal : runtimeFetchedProposal;
  return <ExecutiveProposalPage proposal={proposal as Proposal} />;
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch proposal contents at build-time if on the default network
  invariant(params?.['proposal-id'], 'getStaticProps proposal id not found in params');
  const proposal = await getExecutiveProposal(params['proposal-id']);

  return {
    props: {
      proposal
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const proposals = await getExecutiveProposals();
  const paths = proposals.map(proposal => `/executive/${proposal.key}`);

  return {
    paths,
    fallback: true
  };
};
