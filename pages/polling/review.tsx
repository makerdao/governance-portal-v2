import { GetStaticProps } from 'next';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Heading, Box, Button, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useSWR, { useSWRConfig } from 'swr';
import { isActivePoll, findPollById } from 'modules/polling/helpers/utils';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import { Poll } from 'modules/polling/types';
import ReviewBox from 'modules/polling/components/review/ReviewBox';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { fetchJson } from 'lib/fetchJson';
import { objectToGetParams, getNumberWithOrdinal } from 'lib/utils';
import { SubmitBallotsButtons } from 'modules/polling/components/SubmitBallotButtons';
import CommentTextBox from 'modules/comments/components/CommentTextBox';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { BallotContext } from 'modules/polling/context/BallotContext';
import ActivePollsBox from 'modules/polling/components/review/ActivePollsBox';
import { ShareVotesModal } from 'modules/polling/components/ShareVotesModal';
import InternalIcon from 'modules/app/components/Icon';
import Markdown from 'modules/app/components/Makrdown';
import { InternalLink } from 'modules/app/components/InternalLink';
import { fetchPollingPageData, PollingReviewPageData } from 'modules/polling/api/fetchPollingPageData';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';

const PollingReview = ({ polls }: PollingReviewPageData) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);

  const bpi = useBreakpointIndex();

  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  const [modalPollId, setModalPollId] = useState<number | undefined>(undefined);

  const toggleShareModal = (pollId?: number) => {
    setModalPollId(pollId);
    setShowMarkdownModal(!showMarkdownModal);
  };

  const { ballot, previousBallot, updateVoteFromBallot, transaction, ballotCount } =
    useContext(BallotContext);

  const [transactionStatus, setTransactionStatus] = useState('default');

  useEffect(() => {
    setTransactionStatus(transaction?.status || 'default');
  }, [transaction]);

  const { account } = useAccount();

  const activePolls = polls.filter(poll => isActivePoll(poll));

  // Used to create a string that does not trigger the useMemo of votedPolls to be recreated. (Unique string does not re-render the votedPolls object)
  const ballotKeys = useMemo(() => {
    return Object.keys(ballot).join('');
  }, [ballot]);

  const votedPolls = useMemo(() => {
    return Object.keys(ballot)
      .map(pollId => {
        return findPollById(polls, pollId);
      })
      .filter(p => !!p) as Poll[];
  }, [ballotKeys]);

  const previousVotedPolls = Object.keys(previousBallot)
    .map(pollId => {
      return findPollById(polls, pollId);
    })
    .filter(p => !!p) as Poll[];

  const SubmitButton = props => (
    <Flex sx={{ flexDirection: 'column', width: '100%' }} {...props}>
      <SubmitBallotsButtons
        onSubmit={() => {
          trackButtonClick('submitBallot');
        }}
      />
    </Flex>
  );

  const previousVotesLength = Object.keys(previousBallot).length;

  const votesToTweet = (): string => {
    let url = '';
    let text = '';
    if (modalPollId) {
      // single vote
      const poll = previousVotedPolls.find(poll => poll.pollId === modalPollId);
      if (!poll) return '';
      const option = poll.options[previousBallot[poll.pollId].option as number];
      url = `https://vote.makerdao.com/polling/${poll.slug}`;
      text = `I just voted ${
        option ? option + ' ' : ''
      }on a MakerDAO governance poll! Learn more about the poll on the Governance Portal:`;
    } else {
      // all votes
      url = 'https://vote.makerdao.com';
      text = `I just voted on ${
        previousVotesLength > 1 ? previousVotesLength : 'a'
      } MakerDAO governance poll${
        previousVotesLength > 1 ? 's' : ''
      }! Find my votes and all Maker governance proposals on the Governance Portal:`;
    }

    return (
      'https://twitter.com/share' +
      objectToGetParams({
        url,
        text
      })
    );
  };

  const votesToMarkdown = (): string => {
    let markdown = '';
    let polls;
    if (modalPollId) {
      // single vote
      polls = [previousVotedPolls.find(poll => poll.pollId === modalPollId)];
    } else {
      // all votes
      polls = previousVotedPolls;
    }
    polls.map(poll => {
      const optionData = previousBallot[poll.pollId].option;
      let option;
      if (typeof optionData === 'number') {
        option = `**${poll.options[optionData]}**`;
      } else {
        const markdownArray = (optionData as number[]).map(
          (id, index) => `**${getNumberWithOrdinal(index + 1)} choice:** ${poll.options[id]}  \n`
        );
        option = markdownArray.reduce((previousValue, currentValue) => previousValue + currentValue);
      }
      const comment = previousBallot[poll.pollId]?.comment;
      markdown += `[${poll.title}](https://vote.makerdao.com/polling/${poll.slug}) ([thread](${poll.discussionLink}))  \n`;
      if (option) markdown += `Voted: ${option}  \n`;
      markdown += comment ? `Reasoning: ${comment}  \n` : '  \n';
      markdown += '  \n';
    });
    return markdown;
  };

  const hasVoted = previousVotesLength > 0 && ballotCount === 0;

  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      <Stack gap={3}>
        {!hasVoted && (
          <Heading mb={3} as="h4">
            {bpi <= 2 ? 'Review & Submit Ballot' : 'Review Your Ballot'}
          </Heading>
        )}
        {hasVoted && (
          <Box mb={3}>
            <Heading as="h4">
              You successfully voted on {previousVotesLength} poll{previousVotesLength > 1 ? 's' : ''}.
            </Heading>
            <Text>
              Share your votes to the Forum or Twitter below, or go back to the polls page to edit your votes.
            </Text>
          </Box>
        )}
        <SidebarLayout>
          <Box>
            <Stack gap={2}>
              <InternalLink href={'/polling'} title="View polling page">
                <Button variant="smallOutline" sx={{ width: 'max-content' }}>
                  <Icon name="chevron_left" size="2" mr={2} />
                  Back To All Polls
                </Button>
              </InternalLink>
              <Stack gap={3}>
                {!account && (
                  <Text as="p" sx={{ mt: 3 }}>
                    Connect a wallet to vote
                  </Text>
                )}
                {!!account && votedPolls.length === 0 && !hasVoted && (
                  <Text as="p" sx={{ mt: 3 }}>
                    Your ballot is empty. Go back to the polling page to add votes to your ballot.
                  </Text>
                )}

                {bpi <= 2 && !!account && (
                  <Box>
                    {!hasVoted && <ReviewBox polls={polls} activePolls={activePolls} />}
                    {hasVoted && (
                      <Box>
                        <Heading mb={2} variant="microHeading" sx={{ lineHeight: '33px' }}>
                          Share all your votes
                        </Heading>
                        <ActivePollsBox polls={polls} activePolls={activePolls} voted>
                          <Box p={3}>
                            <Button sx={{ width: '100%' }} onClick={() => toggleShareModal()}>
                              <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                                <InternalIcon name="forum" size={18} /> <Text ml={1}>Share all votes</Text>
                              </Flex>
                            </Button>
                          </Box>
                        </ActivePollsBox>
                      </Box>
                    )}
                  </Box>
                )}

                {!!account && hasVoted && (
                  <Box mt={3}>
                    {previousVotedPolls.map(poll => {
                      return (
                        <Box
                          key={`previous-voted-${poll.pollId}`}
                          data-testid="previously-voted-on"
                          sx={{ mb: 2 }}
                        >
                          <PollOverviewCard
                            poll={poll}
                            reviewPage={true}
                            showVoting={false}
                            // yourVote={
                            //   <Box ml={[0, 3]} mt={[3, 0]}>
                            //     <PollVotedOption
                            //       poll={poll}
                            //       votedOption={previousBallot[poll.pollId].option}
                            //       votingWeight={votingWeight?.total}
                            //       transactionHash={previousBallot[poll.pollId].transactionHash || ''}
                            //       toggleShareModal={toggleShareModal}
                            //     />
                            //   </Box>
                            // }
                            hideTally
                          >
                            {previousBallot[poll.pollId]?.comment && (
                              <Box mt={[1, 3]}>
                                <Text as="p" sx={{ fontWeight: 'semiBold', fontSize: [1, 3], mb: [0, 2] }}>
                                  Your comment
                                </Text>
                                <Text sx={{ fontSize: [1, 3], color: 'onSecondary' }}>
                                  <Markdown text={previousBallot[poll.pollId]?.comment || ''} />
                                </Text>
                              </Box>
                            )}
                          </PollOverviewCard>
                        </Box>
                      );
                    })}
                  </Box>
                )}
                {votedPolls.length > 0 && (
                  <Stack sx={{ display: activePolls.length ? undefined : 'none' }}>
                    {votedPolls.map(poll => {
                      return (
                        <PollOverviewCard key={poll.slug} poll={poll} reviewPage={true} showVoting={true}>
                          <Box sx={{ pt: 2 }}>
                            <CommentTextBox
                              onChange={(val: string) => {
                                updateVoteFromBallot(poll.pollId, {
                                  comment: val
                                });
                              }}
                              value={ballot[poll.pollId].comment || ''}
                              disabled={
                                transactionStatus === 'pending' || transactionStatus === 'initialized'
                              }
                            />
                          </Box>
                        </PollOverviewCard>
                      );
                    })}
                  </Stack>
                )}
                {bpi <= 2 && (
                  <Box>
                    {!hasVoted && <SubmitButton />}
                    {hasVoted && (
                      <Button sx={{ width: '100%' }} onClick={() => toggleShareModal()}>
                        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                          <InternalIcon name="forum" size={18} /> <Text ml={1}>Share all votes</Text>
                        </Flex>
                      </Button>
                    )}
                  </Box>
                )}
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
              {!hasVoted && (
                <Box>
                  <Heading mb={2} variant="microHeading" sx={{ lineHeight: '33px' }}>
                    Submit Ballot
                  </Heading>
                  <ReviewBox polls={polls} activePolls={activePolls} />
                </Box>
              )}
              {hasVoted && (
                <Box>
                  <Heading mb={2} variant="microHeading" sx={{ lineHeight: '33px' }}>
                    Share all your votes
                  </Heading>
                  <ActivePollsBox polls={polls} activePolls={activePolls} voted>
                    <Box p={3}>
                      <Button sx={{ width: '100%' }} onClick={() => toggleShareModal()}>
                        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                          <InternalIcon name="forum" size={18} /> <Text ml={1}>Share all votes</Text>
                        </Flex>
                      </Button>
                    </Box>
                  </ActivePollsBox>
                </Box>
              )}
            </Box>
          )}

          {showMarkdownModal && (
            <ShareVotesModal
              isOpen={showMarkdownModal}
              onDismiss={toggleShareModal}
              markdownContent={votesToMarkdown()}
              twitterContent={votesToTweet()}
            />
          )}
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function PollingReviewPage({ polls: prefetchedPolls }: PollingReviewPageData): JSX.Element {
  const { network } = useActiveWeb3React();

  const fallbackData = isDefaultNetwork(network)
    ? {
        polls: prefetchedPolls
      }
    : null;

  const { cache } = useSWRConfig();
  const cacheKey = `/api/polling?network=${network}`;
  const { data, error } = useSWR<PollingReviewPageData>(
    !network || isDefaultNetwork(network) ? null : cacheKey,
    fetchJson,
    {
      revalidateOnMount: !cache.get(cacheKey),
      ...(fallbackData && { fallbackData })
    }
  );

  if (!isDefaultNetwork(network) && !data && !error) {
    return <PageLoadingPlaceholder />;
  }

  if (error) {
    return <ErrorPage statusCode={500} title="Error fetching data" />;
  }

  const props = {
    polls: isDefaultNetwork(network) ? prefetchedPolls : data?.polls || []
  };

  return (
    <ErrorBoundary componentName="Poll Review">
      <PollingReview {...props} />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { polls } = await fetchPollingPageData(SupportedNetworks.MAINNET);

  return {
    revalidate: 60, // revalidate every 60 seconds
    props: {
      polls
    }
  };
};
