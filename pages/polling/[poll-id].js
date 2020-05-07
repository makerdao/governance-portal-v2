import React from 'react';
import { useRouter } from 'next/router';

import fetchPolls from '../../lib/fetchPolls';
import PrimaryLayout from '../../components/PrimaryLayout';
import markdownToHtml from '../../lib/markdownToHtml';

export default function Poll({ poll }) {
  const { isFallback } = useRouter();

  if (!isFallback && !poll?.multiHash) {
    return (
      <ErrorPage statusCode={404} title="Polling vote could not be found" />
    );
  }

  return (
    <PrimaryLayout>
      {isFallback ? (
        <p>Loading…</p>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: poll.content }} />
      )}
    </PrimaryLayout>
  );
}

export async function getStaticProps({ params }) {
  const poll = (await fetchPolls()).filter(
    (p) => p.multiHash === params['poll-id']
  )[0];

  const content = await markdownToHtml(poll?.content || '');

  return {
    props: {
      poll: {
        ...poll,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const polls = await fetchPolls();
  const paths = polls.map((p) => `/polling/${p.multiHash}`);

  return {
    paths,
    fallback: true,
  };
}
