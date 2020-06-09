/** @jsx jsx */
import { useEffect, useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import invariant from 'tiny-invariant';
import { Card, Flex, Divider, Heading, Text, jsx } from 'theme-ui';

import CountdownTimer from '../../components/CountdownTimer';
import useAccountsStore from '../../stores/accounts';
import getMaker, { isDefaultNetwork } from '../../lib/maker';
import { getPolls, getPoll } from '../../lib/api';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import StackLayout from '../../components/layouts/Stack';
import Tabs from '../../components/Tabs';
import VotingStatus from '../../components/polling/VotingStatus';
import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';

const PollView = ({ poll }: { poll: Poll }) => {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? [`/user/voting-for`, account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address))
  );

  return (
    <PrimaryLayout shortenFooter={true}>
      <SidebarLayout>
        <Card>
          <Flex sx={{ flexDirection: 'column' }}>
            <Text
              sx={{
                fontSize: [2, 3],
                color: 'mutedAlt',
                textTransform: 'uppercase'
              }}
            >
              {new Date(poll.startDate).toLocaleString('default', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <Heading
              my="3"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: [5, 6]
              }}
            >
              {poll.title}
            </Heading>
            <Flex mb={3} sx={{ justifyContent: 'space-between' }}>
              <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
              <VotingStatus poll={poll} allUserVotes={allUserVotes} />
            </Flex>
          </Flex>
          <Divider sx={{ color: 'muted' }} />
          <Tabs
            tabTitles={['Poll Detail', 'Vote Breakdown']}
            tabPanels={[
              <div dangerouslySetInnerHTML={{ __html: poll.content }} />,
              <div>vote breakdown</div>
            ]}
          />
        </Card>
        <Flex sx={{ flexDirection: 'column' }}>
          <StackLayout>
            <Card variant="compact">Card 1</Card>
            <Card variant="compact">Card 2</Card>
          </StackLayout>
        </Flex>
      </SidebarLayout>
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
