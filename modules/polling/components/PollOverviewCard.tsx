import { Icon } from '@makerdao/dai-ui-icons';
import { Card, Text, Flex, Box, Button, ThemeUIStyleObject, Divider, Badge } from 'theme-ui';
import shallow from 'zustand/shallow';
import { isActivePoll } from 'modules/polling/helpers/utils';
import CountdownTimer from 'modules/app/components/CountdownTimer';
import { InternalLink } from 'modules/app/components/InternalLink';
import VotingStatus from './PollVotingStatus';
import { Poll } from 'modules/polling/types';
import { useBreakpointIndex } from '@theme-ui/match-media';
import QuickVote from './QuickVote';
import { PollCategoryTag } from './PollCategoryTag';
import { PollVotePluralityResultsCompact } from './PollVotePluralityResultsCompact';
import { POLL_VOTE_TYPE } from '../polling.constants';
import PollWinningOptionBox from './PollWinningOptionBox';
import { formatDateWithTime } from 'lib/datetime';
import { usePollTally } from '../hooks/usePollTally';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { CardTitle } from 'modules/app/components/Card/CardTitle';
import { CardHeader } from 'modules/app/components/Card/CardHeader';
import { CardSummary } from 'modules/app/components/Card/CardSummary';
import React from 'react';
import CommentCount from 'modules/comments/components/CommentCount';
import { usePollComments } from 'modules/comments/hooks/usePollComments';
import { useAccount } from 'modules/app/hooks/useAccount';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import useUiFiltersStore from 'modules/app/stores/uiFilters';

type Props = {
  poll: Poll;
  reviewPage: boolean;
  sx?: ThemeUIStyleObject;
  showVoting?: boolean;
  children?: React.ReactNode;
  yourVote?: React.ReactNode;
  hideTally?: boolean;
};
export default function PollOverviewCard({
  poll,
  reviewPage,
  showVoting,
  children,
  yourVote,
  hideTally = false,
  ...props
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
    setCategoryFilter({ ...categoryFilter, [category]: !(categoryFilter || {})[category] });
  }

  return (
    <Card
      data-testid="poll-overview-card"
      aria-label="Poll overview"
      sx={{
        p: [0, 0]
      }}
    >
      <Box>
        <ErrorBoundary componentName="Poll Card">
          <Box sx={{ px: [3, 4], py: 3, height: '330px' }}>
            <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Flex sx={{ flexDirection: 'column' }}>
                {bpi === 0 && (
                  <Box sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
                    <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                  </Box>
                )}
                <Box sx={{ cursor: 'pointer' }}>
                  <Box>
                    <Flex sx={{ justifyContent: 'space-between' }}>
                      <CardHeader
                        text={`Posted ${formatDateWithTime(poll.startDate)} | Poll ID ${poll.pollId}`}
                        styles={{ mb: 2 }}
                      />
                      {!showQuickVote && poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE && (
                        <Flex sx={{ alignItems: 'center', mb: 3 }}>
                          <Text variant="caps">Ranked-choice poll</Text>
                          <Icon name="stackedVotes" size={3} ml={2} />
                        </Flex>
                      )}
                    </Flex>
                    <InternalLink href={`/polling/${poll.slug}`} title="View poll details">
                      <CardTitle title={poll.title} />
                    </InternalLink>
                  </Box>
                  <InternalLink href={`/polling/${poll.slug}`} title="View poll details">
                    <CardSummary text={poll.summary} styles={{ my: 2, height: '80px' }} />
                  </InternalLink>
                </Box>

                <Flex>
                  {poll.categories.map(c => (
                    <Box key={c} sx={{ marginRight: 2 }}>
                      <PollCategoryTag onClick={() => onClickCategory(c)} category={c} />
                    </Box>
                  ))}
                </Flex>
                {bpi > 0 && (
                  <Flex mt={3} sx={{ alignItems: 'center' }}>
                    <Box mr={2}>
                      <ErrorBoundary componentName="Countdown Timer">
                        <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                      </ErrorBoundary>
                    </Box>

                    {comments && comments.length > 0 && (
                      <InternalLink href={`/polling/${poll.slug}#comments`} title="View comments">
                        <CommentCount count={comments.length} />
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
                )}
              </Flex>
              {showQuickVote && bpi > 0 && (
                <Box sx={{ ml: 2, minWidth: '265px' }}>
                  <ErrorBoundary componentName="Vote in Poll">
                    <QuickVote poll={poll} showHeader={true} sx={{ maxWidth: 7 }} showStatus={!reviewPage} />
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
                        display: reviewPage ? 'none' : undefined,
                        borderColor: 'text',
                        color: 'text',
                        ':hover': {
                          color: 'text',
                          borderColor: 'onSecondary',
                          backgroundColor: 'background'
                        }
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

                {poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE && (
                  <Box sx={{ width: bpi > 0 ? '265px' : '100%', p: bpi > 0 ? 0 : 2 }}>
                    {tally && tally.totalMkrParticipation > 0 && (
                      <InternalLink
                        href={`/polling/${poll.slug}/#vote-breakdown`}
                        title="View poll vote breakdown"
                      >
                        <Box sx={{ mt: 3 }}>
                          <ErrorBoundary componentName="Poll Results">
                            <PollVotePluralityResultsCompact tally={tally} showTitles={false} />
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
                )}
              </Flex>
            </Box>

            {children && <Box>{children}</Box>}
          </Box>

          {tally && tally.totalMkrParticipation > 0 && (
            <Flex sx={{ flexDirection: 'column', justifySelf: 'flex-end' }}>
              <Divider my={0} />
              <ErrorBoundary componentName="Poll Winning Option">
                <PollWinningOptionBox tally={tally} poll={poll} />
              </ErrorBoundary>
            </Flex>
          )}
        </ErrorBoundary>
      </Box>
    </Card>
  );
}
