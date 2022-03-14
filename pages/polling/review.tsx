import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { Heading, Box, Button, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';
import shallow from 'zustand/shallow';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { isActivePoll, findPollById } from 'modules/polling/helpers/utils';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import { Poll } from 'modules/polling/types';
import ReviewBox from 'modules/polling/components/review/ReviewBox';
import useBallotStore from 'modules/polling/stores/ballotStore';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { fetchJson } from 'lib/fetchJson';
import { SubmitBallotsButtons } from 'modules/polling/components/SubmitBallotButtons';
import CommentTextBox from 'modules/comments/components/CommentTextBox';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';

const PollingReview = ({ polls }: { polls: Poll[] }) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);

  const bpi = useBreakpointIndex();
  const [ballot, previousVotes, setComments, updateComment, comments] = useBallotStore(
    state => [state.ballot, state.previousVotes, state.setComments, state.updateComment, state.comments],
    shallow
  );

  const { account } = useAccount();
  const activePolls = polls.filter(poll => isActivePoll(poll));

  const votedPolls = Object.keys(ballot)
    .map(pollId => {
      return findPollById(polls, pollId);
    })
    .filter(p => !!p) as Poll[];

  const previousVotedPolls = Object.keys(previousVotes)
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
              <Link href={{ pathname: '/polling' }}>
                <Button variant="smallOutline" sx={{ width: 'max-content' }}>
                  <Icon name="chevron_left" size="2" mr={2} />
                  Back To All Polls
                </Button>
              </Link>
              <Stack gap={3}>
                {!account && (
                  <Text as="p" sx={{ mt: 3 }}>
                    Connect a wallet to vote
                  </Text>
                )}
                {!!account && votedPolls.length === 0 && (
                  <Text as="p" sx={{ mt: 3 }}>
                    Your ballot is empty. Go back to the polling page to add votes to your ballot.
                  </Text>
                )}
                {!!account && votedPolls.length === 0 && previousVotedPolls.length > 0 && (
                  <Box mt={3}>
                    <Text mb={3} as="h4">
                      You just voted on:
                    </Text>
                    {previousVotedPolls.map(poll => {
                      return (
                        <Box
                          key={`previous-voted-${poll.pollId}`}
                          data-testid="previously-voted-on"
                          sx={{ mb: 2 }}
                        >
                          <PollOverviewCard poll={poll} reviewPage={true} showVoting={false} />
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {bpi <= 2 && <SubmitButton />}
                {bpi <= 2 && !!account && <ReviewBox polls={polls} activePolls={activePolls} />}
                {votedPolls.length > 0 && (
                  <Stack sx={{ display: activePolls.length ? undefined : 'none' }}>
                    {votedPolls.map(poll => {
                      return (
                        <PollOverviewCard key={poll.slug} poll={poll} reviewPage={true} showVoting={true}>
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
                  </Stack>
                )}

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
  const { network } = useActiveWeb3React();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!network) return;
    if (!isDefaultNetwork(network)) {
      fetchJson(`/api/polling/all-polls?network=${network}`)
        .then(response => _setPolls(response.polls))
        .catch(setError);
    }
  }, [network]);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork(network) && !_polls)
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );

  return <PollingReview polls={isDefaultNetwork(network) ? prefetchedPolls : (_polls as Poll[])} />;
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch polls at build-time if on the default network
  const pollsData = await getPolls();

  return {
    revalidate: 60 * 15, // allow revalidation every 15 minutes
    props: {
      polls: pollsData.polls
    }
  };
};
