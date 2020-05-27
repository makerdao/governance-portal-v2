import { useEffect, useState } from 'react';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { isDefaultNetwork, getNetwork } from '../../lib/maker';
import { getPolls, getPoll } from '../../lib/api';
import { parsePollTally } from '../../lib/utils';
import PrimaryLayout from '../../components/PrimaryLayout';
import Poll from '../../types/poll';

type Props = {
  poll: Poll;
  loading: boolean;
};

const PollPage: React.FC<Props> = ({ poll, loading }) => {
  if (loading)
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  if (!poll?.multiHash) {
    return <ErrorPage statusCode={404} title="Poll could not be found" />;
  }

  const network = getNetwork();
  const hasPollEnded = new Date(poll.endDate).getTime() < new Date().getTime();
  const { data: _tally } = useSWR(
    hasPollEnded
      ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${network}`
      : `/api/polling/tally/${poll.pollId}?network=${network}`
  );

  const tally = _tally ? parsePollTally(_tally, poll) : undefined;

  return (
    <PrimaryLayout>
      <div dangerouslySetInnerHTML={{ __html: poll.content }} />
    </PrimaryLayout>
  );
};

export default ({ poll }) => {
  const [_poll, _setPoll] = useState<Poll>();
  const [loading, setLoading] = useState(false);
  const { query, isFallback } = useRouter();

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      setLoading(true);
      getPoll(query['poll-hash'], { useCache: true }).then(poll => {
        _setPoll(poll);
        setLoading(false);
      });
    }
  }, []);

  return (
    <PollPage
      loading={loading || isFallback}
      poll={isDefaultNetwork() ? poll : _poll}
    />
  );
};

export async function getStaticProps({ params }) {
  // fetch poll contents at build-time if on the default network
  const poll = await getPoll(params['poll-hash'], { useCache: true });

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
