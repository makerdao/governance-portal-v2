/** @jsx jsx */
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { Heading, Box, jsx, Button, Flex } from 'theme-ui';
import ErrorPage from 'next/error';
import invariant from 'tiny-invariant';
import shallow from 'zustand/shallow';

import useBreakpoints from '../../lib/useBreakpoints';
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

const PollingReview = ({ polls }: { polls: Poll[] }) => {
  const bpi = useBreakpoints();
  const [ballot, txId, submitBallot] = useBallotStore(
    state => [state.ballot, state.txId, state.submitBallot],
    shallow
  );

  const account = useAccountsStore(state => state.currentAccount);
  const ballotLength = Object.keys(ballot).length;
  const activePolls = polls.filter(poll => isActivePoll(poll));
  return (
    <PrimaryLayout shortenFooter={true}>
      <Stack gap={3}>
        <SidebarLayout>
          <Box>
            <Stack>
              <div>
                <Heading mb={3} as="h4">
                  {bpi < 2 ? 'Review & Submit Ballot' : 'Review Your Ballot'}
                </Heading>
                <Link href={{ pathname: '/polling', query: { network: getNetwork() } }}>
                  <Button mb={3} variant="smallOutline">
                    Back To All Polls
                  </Button>
                </Link>
                {bpi < 2 && (
                  <Flex sx={{ flexDirection: 'column', width: '100%' }}>
                    <Flex sx={{ flexDirection: 'column' }}>
                      <Button
                        onClick={submitBallot}
                        variant="primary"
                        disabled={!ballotLength || !!txId}
                        sx={{ width: '100%' }}
                      >
                        Submit Your Ballot ({ballotLength}) Votes
                      </Button>
                    </Flex>
                  </Flex>
                )}
                <Stack sx={{ mb: 4, display: activePolls.length ? null : 'none' }}>
                  {Object.keys(ballot).map(pollId => {
                    const poll = findPollById(polls, pollId);
                    invariant(poll !== undefined, 'Unkown poll found on voter ballot');
                    return (
                      <PollOverviewCard key={poll.multiHash} poll={poll} reviewing={true} sending={txId} />
                    );
                  })}
                </Stack>
              </div>
            </Stack>
          </Box>
          <Stack gap={3}>{!!account && <ReviewBox activePolls={activePolls} />}</Stack>
          {bpi < 2 && (
            <Flex sx={{ flexDirection: 'column', width: '100%' }}>
              <Flex sx={{ flexDirection: 'column' }}>
                <Button
                  onClick={submitBallot}
                  variant="primary"
                  disabled={!ballotLength || !!txId}
                  sx={{ width: '100%' }}
                >
                  Submit Your Ballot ({ballotLength}) Votes
                </Button>
              </Flex>
            </Flex>
          )}
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function PollingOverviewPage({ polls: prefetchedPolls }: { polls: Poll[] }): JSX.Element {
  const [_polls, _setPolls] = useState<Poll[]>();
  const [error, setError] = useState<string>();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls().then(_setPolls).catch(setError);
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch polls at build-time if on the default network
  const polls = await getPolls();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls
    }
  };
};
