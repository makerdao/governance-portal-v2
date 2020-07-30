/** @jsx jsx */
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Heading, Box, jsx, Button } from 'theme-ui';
import ErrorPage from 'next/error';

import { isDefaultNetwork, getNetwork } from '../../lib/maker';
import { getPolls } from '../../lib/api';
import { isActivePoll, findPollById } from '../../lib/utils';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';
import PollOverviewCard from '../../components/polling/PollOverviewCard';
import Poll from '../../types/poll';
import ReviewBox from '../../components/polling/ReviewBox';
import useBallotStore from '../../stores/ballot';
import useAccountsStore from '../../stores/accounts';

type Props = {
  polls: Poll[];
};

const PollingReview = ({ polls }: Props) => {
  const [startDate] = useState<Date | ''>('');
  const [endDate] = useState<Date | ''>('');
  const [categoryFilter] = useState<{ [category: string]: boolean }>(
    polls.map(poll => poll.category).reduce((acc, category) => ({ ...acc, [category]: true }), {})
  );
  const ballot = useBallotStore(state => state.ballot);

  const network = getNetwork();

  useEffect(() => {
    if (location.href.includes('pollFilter=active')) {
      // setFilterInactivePolls(true);
    }
  }, []);

  const filteredPolls = useMemo(() => {
    const start = startDate && new Date(startDate);
    const end = endDate && new Date(endDate);
    return polls.filter(poll => {
      if (start && new Date(poll.startDate).getTime() < start.getTime()) return false;
      if (end && new Date(poll.startDate).getTime() > end.getTime()) return false;
      return categoryFilter[poll.category];
    });
  }, [polls, startDate, endDate, categoryFilter]);

  const activePolls = filteredPolls.filter(poll => isActivePoll(poll));

  const account = useAccountsStore(state => state.currentAccount);

  return (
    <PrimaryLayout shortenFooter={true}>
      <Stack gap={3}>
        <SidebarLayout>
          <Box>
            <Stack>
              <div>
                <Heading mb={3} as="h4">
                  Review Your Ballot
                </Heading>
                <Link href={{ pathname: '/polling', query: { network } }}>
                  <Button mb={3} variant="smallOutline">
                    Back To All Polls
                  </Button>
                </Link>
                <Stack sx={{ mb: 4, display: activePolls.length ? null : 'none' }}>
                  {Object.keys(ballot).map(pollId => {
                    const poll = findPollById(activePolls, pollId);
                    poll && <PollOverviewCard key={poll && poll.multiHash} poll={poll} />;
                  })}
                </Stack>
              </div>
            </Stack>
          </Box>
          <Stack gap={3}>
            {account && <ReviewBox activePolls={activePolls} />}
          </Stack>
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function PollingOverviewPage({ polls: prefetchedPolls }: Props) {
  const [_polls, _setPolls] = useState<Poll[]>();
  const [error, setError] = useState<string>();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls()
        .then(_setPolls)
        .catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && !_polls)
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return <PollingReview polls={isDefaultNetwork() ? prefetchedPolls : (_polls as Poll[])} />;
}

export async function getStaticProps() {
  // fetch polls at build-time if on the default network
  const polls = await getPolls();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls
    }
  };
}
