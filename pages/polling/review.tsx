import { GetStaticProps } from 'next';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Heading, Box, Button, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useSWR, { useSWRConfig } from 'swr';
import { isActivePoll, findPollById, isInputFormatRankFree } from 'modules/polling/helpers/utils';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import { Poll } from 'modules/polling/types';
import ReviewBox from 'modules/polling/components/review/ReviewBox';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { objectToGetParams, getNumberWithOrdinal } from 'lib/utils';
import CommentTextBox from 'modules/comments/components/CommentTextBox';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
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
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { getBlockExplorerName } from 'modules/web3/helpers/chain';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';

type PollingReviewProps = {
  polls: Poll[];
  network: SupportedNetworks;
};

const PollingReview = ({ polls, network }: PollingReviewProps) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);

  const bpi = useBreakpointIndex();

  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  const [modalPollId, setModalPollId] = useState<number | undefined>(undefined);
  const toggleShareModal = (pollId?: number) => {
    setModalPollId(pollId);
    setShowMarkdownModal(!showMarkdownModal);
  };

  const { ballot, ballotStep, previousBallot, updateVoteFromBallot, transaction, ballotCount } =
    useContext(BallotContext);

  const [transactionStatus, setTransactionStatus] = useState('default');

  useEffect(() => {
    setTransactionStatus(transaction?.status || 'default');
  }, [transaction]);

  const { account, votingAccount } = useAccount();

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
          (id, index) =>
            `${
              isInputFormatRankFree(poll.parameters) ? `**${getNumberWithOrdinal(index + 1)} choice:**` : ''
            } ${poll.options[id]}  \n`
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

  const ballotPollIds = Object.keys(ballot);
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
              You successfully voted on {previousVotesLength} poll{previousVotesLength > 1 ? 's' : ''}
            </Heading>
            <Text as="p" sx={{ mt: 2 }}>
              Share your votes to the Forum or Twitter below, or go back to the polls page to edit your votes
            </Text>
            <Flex sx={{ alignItems: 'center', mt: 1, gap: 1, flexWrap: 'wrap' }}>
              <Flex sx={{ alignItems: 'center', gap: 1 }}>
                <Icon name="info" color="textSecondary" />
                <Text as="p" variant="secondary">
                  Your vote and comment may take a few minutes to appear in the Voting Portal.
                </Text>
              </Flex>
              {transaction?.hash && (
                <ExternalLink
                  title="See transaction details"
                  href={getEtherscanLink(
                    transaction.gaslessNetwork ?? network,
                    transaction.hash,
                    'transaction'
                  )}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Text sx={{ mr: 1, color: 'accentBlue' }} variant="secondary">
                      View on {getBlockExplorerName(transaction.gaslessNetwork ?? network)}
                    </Text>
                    <Icon sx={{ ml: 'auto' }} name="arrowTopRight" size={2} color="accentBlue" />
                  </Flex>
                </ExternalLink>
              )}
            </Flex>
          </Box>
        )}
        <SidebarLayout>
          <Box>
            <Stack gap={3}>
              <InternalLink href={'/polling'} title="View polling page">
                <Button variant="mutedOutline" sx={{ width: 'max-content' }}>
                  <Icon name="chevron_left" size="2" mr={2} />
                  Back to All Polls
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

                {bpi <= 2 && !!votingAccount && (
                  <Box>
                    {!hasVoted && (
                      <ReviewBox
                        account={votingAccount}
                        polls={polls}
                        activePolls={activePolls}
                        ballotPollIds={ballotPollIds}
                      />
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

                {!!account && hasVoted && (
                  <Box mt={3}>
                    {previousVotedPolls.map(poll => {
                      return (
                        <Box
                          key={`previous-voted-${poll.pollId}`}
                          data-testid="previously-voted-on"
                          sx={{ mb: 2 }}
                        >
                          <PollOverviewCard poll={poll} reviewPage={true} showVoting={true}>
                            {previousBallot[poll.pollId]?.comment && (
                              <Box mt={[1, 3]}>
                                <Flex sx={{ alignItems: 'center', mb: [0, 2] }}>
                                  <Text as="p" sx={{ fontWeight: 'semiBold', fontSize: [1, 3], mr: 1 }}>
                                    Your comment
                                  </Text>
                                </Flex>
                                <Box sx={{ bg: 'onSurfaceAlt', py: 1, px: 3, borderRadius: 'medium' }}>
                                  <Text as="p">
                                    <Markdown text={previousBallot[poll.pollId]?.comment || ''} />
                                  </Text>
                                </Box>
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
                        <Box key={poll.slug} sx={{ mb: 3 }}>
                          <PollOverviewCard poll={poll} reviewPage={true} showVoting={true}>
                            <Box sx={{ pt: 2 }}>
                              <CommentTextBox
                                onChange={(val: string) => {
                                  updateVoteFromBallot(poll.pollId, {
                                    comment: val
                                  });
                                }}
                                value={ballot[poll.pollId].comment || ''}
                                disabled={
                                  ballotStep === 'submitting' ||
                                  ballotStep === 'awaiting-relayer' ||
                                  transactionStatus === 'pending' ||
                                  transactionStatus === 'initialized'
                                }
                              />
                            </Box>
                          </PollOverviewCard>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
                {bpi <= 2 && (
                  <Box>
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
                    <AccountNotConnected message="Connect your wallet to review your ballot" />
                  </Box>
                )}
              </Stack>
            </Stack>
          </Box>

          {bpi >= 3 && !!votingAccount && (
            <Box sx={{ pt: 3 }}>
              {!hasVoted && (
                <Box>
                  <Heading mb={2} variant="microHeading" sx={{ lineHeight: '33px' }}>
                    Submit Ballot
                  </Heading>
                  <ReviewBox
                    account={votingAccount}
                    polls={polls}
                    activePolls={activePolls}
                    ballotPollIds={ballotPollIds}
                  />
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
  const { network } = useWeb3();

  const fallbackData = isDefaultNetwork(network)
    ? {
        polls: prefetchedPolls
      }
    : null;

  const { cache } = useSWRConfig();
  const cacheKey = `page/polling/${network}`;
  const { data, error } = useSWR<PollingReviewPageData>(
    !network || isDefaultNetwork(network) ? null : cacheKey,
    () => fetchPollingPageData(network, true),
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
    polls: isDefaultNetwork(network) ? prefetchedPolls : data?.polls || [],
    network
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
