import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { Heading, Box, Button, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';
import invariant from 'tiny-invariant';
import shallow from 'zustand/shallow';

import { useBreakpointIndex } from '@theme-ui/match-media';
import { isDefaultNetwork, getNetwork } from 'lib/maker';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { isActivePoll, findPollById } from 'modules/polling/helpers/utils';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import { Poll } from 'modules/polling/types';
import ReviewBox from 'modules/polling/components/review/ReviewBox';
import useBallotStore from 'stores/ballot';
import useAccountsStore from 'stores/accounts';
import MobileVoteSheet from 'modules/polling/components/MobileVoteSheet';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { fetchJson } from 'lib/fetchJson';

const PollingReview = ({ polls }: { polls: Poll[] }) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);

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
          onClick={() => {
            trackButtonClick('submitBallot');
            submitBallot();
          }}
          variant="primaryLarge"
          disabled={!ballotLength || !!txId}
          sx={{ width: '100%', mt: 2 }}
        >
          Submit Your Ballot ({ballotLength} vote{ballotLength === 1 ? '' : 's'})
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      {mobileVotingPoll && (
        <MobileVoteSheet
          account={account}
          editingOnly
          poll={mobileVotingPoll}
          close={() => setMobileVotingPoll(null)}
        />
      )}
      <Stack gap={3}>
        <Heading mb={3} as="h4">
          {bpi <= 2 ? 'Review & Submit Ballot' : 'Review Your Ballot'}
        </Heading>
        <SidebarLayout>
          <Box>
            <Stack gap={2}>
              <Link href={{ pathname: '/polling', query: { network: getNetwork() } }}>
                <Button variant="smallOutline" sx={{ width: 'max-content' }}>
                  <Icon name="chevron_left" size="2" mr={2} />
                  Back To All Polls
                </Button>
              </Link>
              <Stack gap={3}>
                {bpi <= 2 && <SubmitButton />}
                {bpi <= 2 && !!account && <ReviewBox polls={polls} activePolls={activePolls} />}
                <Stack sx={{ display: activePolls.length ? undefined : 'none' }}>
                  {Object.keys(ballot).map((pollId, index) => {
                    const poll = findPollById(polls, pollId);

                    if (!poll) {
                      return null;
                    }
                    return (
                      <PollOverviewCard
                        key={poll.multiHash}
                        poll={poll}
                        reviewPage={true}
                        showVoting={true}
                        startMobileVoting={() => setMobileVotingPoll(poll)}
                        sx={cardStyles(index, ballotLength)}
                      />
                    );
                  })}
                </Stack>
                {bpi <= 2 && <SubmitButton />}
              </Stack>
            </Stack>
          </Box>
          {bpi >= 3 && !!account && (
            <Box sx={{ pt: 3 }}>
              <Heading mb={2} variant="microHeading" sx={{ lineHeight: '33px' }}>
                Submit Ballot
              </Heading>
              <ReviewBox polls={polls} activePolls={activePolls} />
            </Box>
          )}
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

const cardStyles = (index, ballotLength) =>
  ballotLength === 1
    ? {}
    : index === 0
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
      fetchJson(`/api/polling/all-polls?network=${getNetwork()}`)
        .then(response => _setPolls(response.polls))
        .catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && !_polls)
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );

  return <PollingReview polls={isDefaultNetwork() ? prefetchedPolls : (_polls as Poll[])} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch polls at build-time if on the default network
  const pollsData = await getPolls();

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls: pollsData.polls
    }
  };
};
