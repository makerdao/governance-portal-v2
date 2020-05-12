import React from 'react';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';

import PrimaryLayout from '../../components/PrimaryLayout';
import markdownToHtml from '../../lib/markdownToHtml';
import fetchExecutiveProposals from '../../lib/fetchExecutiveProposals';

export default function ExecutiveProposal({ proposal }) {
  const { isFallback } = useRouter();

  if (!isFallback && !proposal?.key) {
    return (
      <ErrorPage
        statusCode={404}
        title="Executive proposal could not be found"
      />
    );
  }

  return (
    <PrimaryLayout>
      {isFallback ? (
        <p>Loading…</p>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: proposal.content }} />
      )}
    </PrimaryLayout>
  );
}

export async function getStaticProps({ params }) {
  const proposals = await fetchExecutiveProposals();
  const proposal = proposals.find(
    (proposal) => proposal.key === params['proposal-id']
  );
  const content = await markdownToHtml(proposal?.about || '');

  return {
    props: {
      proposal: {
        ...proposal,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const proposals = await fetchExecutiveProposals();
  const paths = proposals.map((proposal) => `/executive/${proposal.key}`);

  return {
    paths,
    fallback: true,
  };
}
