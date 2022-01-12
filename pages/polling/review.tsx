import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { Heading, Box, Button, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';
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
import useBallotStore from 'modules/polling/stores/ballotStore';
import useAccountsStore from 'modules/app/stores/accounts';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { fetchJson } from 'lib/fetchJson';
import { SubmitBallotsButtons } from 'modules/polling/components/SubmitBallotButtons';
import CommentTextBox from 'modules/comments/components/CommentTextBox';

const PollingReview = ({ polls }: { polls: Poll[] }) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);

  const bpi = useBreakpointIndex();
  const [ballot, setComments, updateComment, comments] = useBallotStore(
    state => [state.ballot, state.setComments, state.updateComment, state.comments],
    shallow
  );

  const account = useAccountsStore(state => state.currentAccount);

  const activePolls = polls.filter(poll => isActivePoll(poll));

  const votedPolls = Object.keys(ballot)
    .map(pollId => {
      return findPollById(polls, pollId);
    })
    .filter(p => !!p) as Poll[];

  useEffect(() => {
    // Reset previous comments on load.
    setComments([]);
  }, []);

  const SubmitButton = props => (
    <Flex sx={{ flexDirection: 'column', width: '100%' }} {...props}>
      <SubmitBallotsButtons
        onSubmit={() => {
          trackButtonClick('submitBallot');
        }}
      />
    </Flex>
  );
  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
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
                {votedPolls.length > 0 && <Stack sx={{ display: activePolls.length ? undefined : 'none' }}>
                  {votedPolls.map(poll => {
                    return (
                      <PollOverviewCard key={poll.multiHash} poll={poll} reviewPage={true} showVoting={true}>
                        <Box sx={{ pt: 2 }}>
                          <CommentTextBox
                            onChange={(val: string) => {
                              updateComment(val, poll.pollId);
                            }}
                            value={comments.find(i => i.pollId === poll.pollId)?.comment || ''}
                          />
                        </Box>
                      </PollOverviewCard>
                    );
                  })}
                </Stack>}
                {votedPolls.length === 0 && <Box>
                  <Text>There are no polls added to your ballot.</Text>  
                </Box>}
                {bpi <= 2 && <SubmitButton />}

                {!account && (
                  <Box pt="3">
                    <Text>Connect your wallet to review your ballot</Text>
                  </Box>
                )}
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

export const getStaticProps: GetStaticProps = async () => {
  // fetch polls at build-time if on the default network
  const pollsData = await getPolls();

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls: pollsData.polls
    }
  };
};
