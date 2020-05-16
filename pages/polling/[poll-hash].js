import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { getNetwork, isDefaultNetwork } from '../../lib/maker';
import { getPolls, getPoll, getPollTally } from '../../lib/api';
import PrimaryLayout from '../../components/PrimaryLayout';

export default function Poll({ poll }) {
  // const network = getNetwork();
  const { isFallback } = useRouter();
  // const { data } = useSWR(
  //   poll?.pollId ? ['/polling/tally', poll.pollId] : null,
  //   (_, pollId) => getPollTally(pollId)
  // );

  // const { data: polls } = useSWR(
  //   isDefaultNetwork() ? null : ['/polling/polls', network],
  //   getPolls
  // );
  // const { data: poll } = useSWR(
  //   isDefaultNetwork() && polls ? null : ['/polling/poll', pollId, polls],
  //   (_, polls) => getPoll()
  // );

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
        <>
          <div dangerouslySetInnerHTML={{ __html: poll.content }} />
        </>
      )}
    </PrimaryLayout>
  );
}

export async function getStaticProps({ params }) {
  const poll = await getPoll(params['poll-hash']);

  return {
    props: {
      poll
    }
  };
}

export async function getStaticPaths() {
  const polls = await getPolls();
  const paths = polls.map(p => `/polling/${p.multiHash}`);

  return {
    paths,
    fallback: true
  };
}
