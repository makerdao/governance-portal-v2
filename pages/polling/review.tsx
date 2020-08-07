/** @jsx jsx */
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { Heading, Box, jsx, Button, Flex } from 'theme-ui';
import ErrorPage from 'next/error';
import invariant from 'tiny-invariant';
import shallow from 'zustand/shallow';

import { useBreakpointIndex } from '@theme-ui/match-media';
import { isDefaultNetwork, getNetwork } from '../../lib/maker';
import { getPolls } from '../../lib/api';
import { isActivePoll, findPollById } from '../../lib/utils';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout, { StickyColumn } from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';
import PollOverviewCard from '../../components/polling/PollOverviewCard';
import Poll from '../../types/poll';
import ReviewBox from '../../components/polling/ReviewBox';
import useBallotStore from '../../stores/ballot';
import useAccountsStore from '../../stores/accounts';
import MobileVoteSheet from '../../components/polling/MobileVoteSheet';

const PollingReview = ({ polls }: { polls: Poll[] }) => {
  const bpi = useBreakpointIndex();
  const [ballot, txId, submitBallot] = useBallotStore(
    state => [state.ballot, state.txId, state.submitBallot],
    shallow
  );

  const account = useAccountsStore(state => state.currentAccount);
  const ballotLength = Object.keys(ballot).length;
  const activePolls = polls.filter(poll => isActivePoll(poll));
  const [mobileVotingPoll, setMobileVotingPoll] = useState<Poll | null>(null);

  const SubmitButton = props => (
    <Flex sx={{ flexDirection: 'column', width: '100%' }} {...props}>
      <Flex sx={{ flexDirection: 'column' }}>
        <Button
          onClick={submitBallot}
          variant="primary"
          disabled={!ballotLength || !!txId}
          sx={{ width: '100%' }}
        >
          Submit Your Ballot ({ballotLength} vote{ballotLength === 1 ? '' : 's'})
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <PrimaryLayout shortenFooter={true}>
      {mobileVotingPoll && (
        <MobileVoteSheet editingOnly poll={mobileVotingPoll} close={() => setMobileVotingPoll(null)} />
      )}
      <Stack gap={3} sx={{ mb: 4 }}>
        <Heading mb={3} as="h4">
          {bpi <= 2 ? 'Review & Submit Ballot' : 'Review Your Ballot'}
        </Heading>
        <SidebarLayout>
          <Stack gap={2}>
            <Link href={{ pathname: '/polling', query: { network: getNetwork() } }}>
              <Button variant="smallOutline" sx={{ width: 'max-content' }}>
                Back To All Polls
              </Button>
            </Link>
            <Stack gap={3}>
              {bpi <= 2 && <SubmitButton />}
              {bpi <= 2 && !!account && <ReviewBox activePolls={activePolls} />}
              <Stack sx={{ display: activePolls.length ? null : 'none' }}>
                {Object.keys(ballot).map((pollId, index) => {
                  const poll = findPollById(polls, pollId);
                  invariant(poll !== undefined, 'Unknown poll found on voter ballot');
                  return (
                    <PollOverviewCard
                      key={poll.multiHash}
                      poll={poll}
                      reviewing={true}
                      sending={txId}
                      startMobileVoting={() => setMobileVotingPoll(poll)}
                      sx={cardStyles(index, ballotLength)}
                    />
                  );
                })}
              </Stack>
              {bpi <= 2 && <SubmitButton />}
            </Stack>
          </Stack>
          {bpi === 3 && !!account && (
            <StickyColumn>
              <Heading mb={2} as="h4" sx={{ lineHeight: '33px' }}>
                Submit Ballot
              </Heading>
              <ReviewBox activePolls={activePolls} />
            </StickyColumn>
          )}
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

const cardStyles = (index, ballotLength) =>
  index === 0
    ? {
        borderBottomLeftRadius: '0 !important',
        borderBottomRightRadius: '0 !important',
        borderBottom: '0 !important'
      }
    : index === ballotLength - 1
    ? {
        borderTopLeftRadius: '0 !important',
        borderTopRightRadius: '0 !important',
        mt: '0 !important'
      }
    : {
        borderRadius: '0 !important',
        borderBottom: '0 !important',
        mt: '0 !important'
      };

export default function PollingReviewPage({ polls: prefetchedPolls }: { polls: Poll[] }): JSX.Element {
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
