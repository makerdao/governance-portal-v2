/** @jsx jsx */
import { useEffect, useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import invariant from 'tiny-invariant';
import { Card, Flex, jsx } from 'theme-ui';

import { isDefaultNetwork, getNetwork } from '../../lib/maker';
import { getPolls, getPoll } from '../../lib/api';
import { parsePollTally, fetchJson } from '../../lib/utils';
import PrimaryLayout from '../../components/layouts/Primary';
import DetailsPageLayout from '../../components/layouts/DetailsPage';
import TabbedLayout from '../../components/TabbedLayout';
import Poll from '../../types/poll';

type Props = {
  poll: Poll;
};

const PollView = ({ poll }: Props) => {
  const hasPollEnded = new Date(poll.endDate).getTime() < new Date().getTime();
  const { data: tally } = useSWR(
    hasPollEnded
      ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${getNetwork()}`
      : `/api/polling/tally/${poll.pollId}?network=${getNetwork()}`,
    async url => parsePollTally(await fetchJson(url), poll)
  );

  return (
    <PrimaryLayout shortenFooter={true}>
      <DetailsPageLayout>
        <Card>
          <TabbedLayout
            tabTitles={['Poll Detail', 'Vote Breakdown']}
            tabPanels={[
              <div dangerouslySetInnerHTML={{ __html: poll.content }} />,
              <div>vote breakdown</div>
            ]}
          />
        </Card>
        <Flex sx={{ flexDirection: 'column' }}>
          <Card variant="compact">Card 1</Card>
          <Card variant="compact">Card 2</Card>
        </Flex>
      </DetailsPageLayout>
    </PrimaryLayout>
  );
};

export default function PollPage({ poll: prefetchedPoll }: { poll?: Poll }) {
  const [_poll, _setPoll] = useState<Poll>();
  const [error, setError] = useState<string>();
  const { query, isFallback } = useRouter();

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork() && query['poll-hash']) {
      getPoll(query['poll-hash'] as string)
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

  const poll = isDefaultNetwork() ? prefetchedPoll : _poll;
  return <PollView poll={poll as Poll} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch poll contents at build-time if on the default network
  invariant(params?.['poll-hash'], 'getStaticProps poll hash not found in params');
  const poll = await getPoll(params['poll-hash'] as string);

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
