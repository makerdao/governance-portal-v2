import React from 'react';
import { Icon } from '@makerdao/dai-ui-icons';
import { Card, Text, Flex, Box, Button, ThemeUIStyleObject, Divider, Badge } from 'theme-ui';
import shallow from 'zustand/shallow';
import {
  isActivePoll,
  isResultDisplayApprovalBreakdown,
  isResultDisplayInstantRunoffBreakdown,
  isResultDisplaySingleVoteBreakdown
} from 'modules/polling/helpers/utils';
import CountdownTimer from 'modules/app/components/CountdownTimer';
import { InternalLink } from 'modules/app/components/InternalLink';
import VotingStatus from './PollVotingStatus';
import { Poll } from 'modules/polling/types';
import { useBreakpointIndex } from '@theme-ui/match-media';
import QuickVote from './poll-vote-input/QuickVote';
import { PollCategoryTag } from './PollCategoryTag';
import { PluralityVoteSummary } from './vote-summary/PluralityVoteSummary';
import PollWinningOptionBox from './PollWinningOptionBox';
import { formatDateWithTime } from 'lib/datetime';
import { usePollTally } from '../hooks/usePollTally';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { CardTitle } from 'modules/app/components/Card/CardTitle';
import { CardHeader } from 'modules/app/components/Card/CardHeader';
import { CardSummary } from 'modules/app/components/Card/CardSummary';
import CommentCount from 'modules/comments/components/CommentCount';
import { usePollComments } from 'modules/comments/hooks/usePollComments';
import { useAccount } from 'modules/app/hooks/useAccount';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { RankedChoiceVoteSummary } from './vote-summary/RankedChoiceVoteSummary';
import { PollVoteTypeIndicator } from './PollOverviewCard/PollVoteTypeIndicator';
import { ApprovalVoteSummary } from './vote-summary/ApprovalVoteSummary';

type Props = {
  poll: Poll;
  reviewPage: boolean;
  sx?: ThemeUIStyleObject;
  showVoting?: boolean;
  children?: React.ReactNode;
  hideTally?: boolean;
};
export default function PollOverviewCard({
  poll,
  reviewPage,
  showVoting,
  children,
  hideTally = false
}: Props): JSX.Element {
  const { account } = useAccount();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const canVote = !!account && isActivePoll(poll);
  const showQuickVote = canVote && showVoting;
  const { comments, error: errorComments } = usePollComments(poll.pollId);
  const { tally, error: errorTally, isValidating } = usePollTally(hideTally ? 0 : poll.pollId);
  const [categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  function onClickCategory(category) {
    setCategoryFilter({ ...categoryFilter, [category.id]: !(categoryFilter || {})[category.id] });
  }

  const myComment = comments?.find(c => {
    return c.comment.hotAddress.toLowerCase() === account?.toLowerCase();
  });

  const hasPollComments = comments && comments.length > 0;
  const hasUserComments = hasPollComments && myComment;

  return (
    <Card
      data-testid="poll-overview-card"
      aria-label="Poll overview"
      sx={{
        p: [0, 0]
      }}
    >
      <Flex sx={{ flexDirection: 'column' }}>
        <ErrorBoundary componentName="Poll Card">
          <Box sx={{ px: [3, 4], py: 3 }}>
            <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', minHeight: 210 }}>
              <Flex sx={{ flexDirection: 'column', width: '100%' }}>
                {bpi === 0 && (
                  <Box sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
                    <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                  </Box>
                )}
                <Box>
                  <Box>
                    <Flex sx={{ justifyContent: 'space-between' }}>
                      <CardHeader
                        text={`Posted ${formatDateWithTime(poll.startDate)} | Poll ID ${poll.pollId}`}
                        styles={{ mb: 2 }}
                      />
                      {!showQuickVote && (
                        <Box sx={{ mb: 3 }}>
                          <PollVoteTypeIndicator poll={poll} />
                        </Box>
                      )}
                    </Flex>
                    <InternalLink href={`/polling/${poll.slug}`} title="View poll details">
                      <CardTitle title={poll.title} dataTestId="poll-overview-card-poll-title" />
                    </InternalLink>
                  </Box>
                  <InternalLink href={`/polling/${poll.slug}`} title="View poll details">
                    <CardSummary text={poll.summary} styles={{ my: 2 }} />
                  </InternalLink>
                </Box>

                <Flex sx={{ flexWrap: 'wrap' }}>
                  {poll.tags.map(c => (
                    <Box key={c.id} sx={{ marginRight: 2, marginBottom: 2 }}>
                      <PollCategoryTag onClick={() => onClickCategory(c)} tag={c} />
                    </Box>
                  ))}
                </Flex>
                {bpi > 0 && (
                  <Flex mt={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box>
                      <ErrorBoundary componentName="Countdown Timer">
                        <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                      </ErrorBoundary>
                    </Box>
                    <Flex sx={{ gap: 2, flexWrap: 'wrap' }}>
                      {hasPollComments && (
                        <InternalLink href={`/polling/${poll.slug}`} title="View comments" hash="comments">
                          <CommentCount count={comments.length} />
                        </InternalLink>
                      )}
                      {hasUserComments && (
                        <InternalLink href={`/polling/${poll.slug}`} title="Your Comment" hash="comments">
                          <Flex sx={{ alignItems: 'center', gap: 2 }}>
                            <Icon name="yourComment" color="primary" size={3} />
                            <Text variant="caps" color="primary">
                              Your Comment
                            </Text>
                          </Flex>
                        </InternalLink>
                      )}
                      {errorComments && (
                        <Badge
                          variant="warning"
                          sx={{
                            color: 'warning',
                            borderColor: 'warning',
                            textTransform: 'uppercase',
                            display: 'inline-flex',
                            alignItems: 'center',
                            m: 1
                          }}
                        >
                          Error loading comments
                        </Badge>
                      )}
                    </Flex>
                  </Flex>
                )}
              </Flex>
              {showQuickVote && bpi > 0 && (
                <Box sx={{ ml: 2, minWidth: '265px' }}>
                  <ErrorBoundary componentName="Vote in Poll">
                    <Box sx={{ maxWidth: 7 }}>
                      <QuickVote poll={poll} showHeader={true} showStatus={!reviewPage} />
                    </Box>
                  </ErrorBoundary>
                </Box>
              )}
            </Flex>

            <Box>
              <Flex
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: ['column', 'row']
                }}
              >
                <Flex
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: bpi > 0 ? 'auto' : '100%',
                    p: 0,
                    mt: 3
                  }}
                >
                  <InternalLink href={`/polling/${poll.slug}`} title="View poll details">
                    <Button
                      variant="outline"
                      sx={{
                        display: reviewPage ? 'none' : undefined
                      }}
                    >
                      View Details
                    </Button>
                  </InternalLink>
                </Flex>

                {showQuickVote && bpi === 0 && (
                  <Box sx={{ mt: 3, width: '100%' }}>
                    <ErrorBoundary componentName="Voting Status">
                      <VotingStatus poll={poll} />
                    </ErrorBoundary>
                    <ErrorBoundary componentName="Vote in Poll">
                      <QuickVote poll={poll} showHeader={false} showStatus={!reviewPage} />
                    </ErrorBoundary>
                  </Box>
                )}

                <Box sx={{ width: bpi > 0 ? '265px' : '100%', p: bpi > 0 ? 0 : 2 }}>
                  {tally && tally.totalMkrParticipation > 0 && (
                    <InternalLink
                      href={`/polling/${poll.slug}`}
                      hash="vote-breakdown"
                      title="View poll vote breakdown"
                    >
                      <Box sx={{ mt: 3 }}>
                        <ErrorBoundary componentName="Poll Results">
                          {isResultDisplaySingleVoteBreakdown(poll.parameters) && (
                            <PluralityVoteSummary tally={tally} showTitles={false} />
                          )}
                          {isResultDisplayInstantRunoffBreakdown(poll.parameters) && (
                            <RankedChoiceVoteSummary
                              choices={tally.results.map(i => i.optionId)}
                              poll={poll}
                              limit={3}
                            />
                          )}
                          {isResultDisplayApprovalBreakdown(poll.parameters) && (
                            <ApprovalVoteSummary
                              choices={tally.results.map(i => i.optionId)}
                              poll={poll}
                              limit={3}
                            />
                          )}
                        </ErrorBoundary>
                      </Box>
                    </InternalLink>
                  )}
                  {!tally && isValidating && !errorTally && (
                    <SkeletonThemed width={'265px'} height={'30px'} />
                  )}
                  {errorTally && !isValidating && (
                    <Badge
                      variant="warning"
                      sx={{
                        color: 'warning',
                        borderColor: 'warning',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        m: 1
                      }}
                    >
                      Error loading votes
                    </Badge>
                  )}
                </Box>
              </Flex>
            </Box>

            {children && <Box>{children}</Box>}
          </Box>

          {tally && (
            <Flex sx={{ flexDirection: 'column', justifySelf: 'flex-end' }}>
              <Divider my={0} />
              <ErrorBoundary componentName="Poll Winning Option">
                <PollWinningOptionBox tally={tally} poll={poll} />
              </ErrorBoundary>
            </Flex>
          )}
        </ErrorBoundary>
      </Flex>
    </Card>
  );
}
