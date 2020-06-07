import { useEffect, useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import invariant from 'tiny-invariant';

import { isDefaultNetwork, getNetwork } from '../../lib/maker';
import { getPolls, getPoll } from '../../lib/api';
import { parsePollTally } from '../../lib/utils';
import PrimaryLayout from '../../components/layouts/Primary';
import Poll from '../../types/poll';

type Props = {
  poll: Poll;
  loading: boolean;
};

const PollView = ({ poll, loading }: Props) => {
  const hasPollEnded = new Date(poll.endDate).getTime() < new Date().getTime();
  const { data: rawTally } = useSWR(
    hasPollEnded
      ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${getNetwork()}`
      : `/api/polling/tally/${poll.pollId}?network=${getNetwork()}`
  );

  const tally = rawTally ? parsePollTally(rawTally, poll) : undefined;

  return (
    <PrimaryLayout>
      <div dangerouslySetInnerHTML={{ __html: poll.content }} />
    </PrimaryLayout>
  );
};

export default function PollPage({ poll: prefetchedPoll }: { poll: Poll }) {
  const [_poll, _setPoll] = useState<Poll>();
  const [error, setError] = useState<string>();
  const { query, isFallback } = useRouter();

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork() && query['poll-hash']) {
      getPoll(query['poll-hash'])
        .then(_setPoll)
        .catch(setError);
    }
  }, [query['poll-hash']]);

  if (error || (isDefaultNetwork() && !isFallback && !prefetchedPoll?.multiHash)) {
    return (
      <ErrorPage statusCode={404} title="Poll either does not exist, or could not be fetched at this time" />
    );
  }

  if (isFallback || (!isDefaultNetwork() && !_poll))
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return <PollView poll={isDefaultNetwork() ? prefetchedPoll : _poll} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch poll contents at build-time if on the default network
  invariant(params?.['poll-hash'], 'getStaticProps poll hash not found in params');
  const poll = await getPoll(params['poll-hash']);

  return {
    props: {
      poll
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const polls = await getPolls();
  const paths = polls.map(p => `/polling/${p.multiHash}`);

  return {
    paths,
    fallback: true
  };
};
