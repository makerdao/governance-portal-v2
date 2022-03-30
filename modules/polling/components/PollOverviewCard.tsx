import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import { Text, Flex, Box, Button, Link as ThemeUILink, ThemeUIStyleObject, Divider, Badge } from 'theme-ui';
import { isActivePoll } from 'modules/polling/helpers/utils';
import Stack from '../../app/components/layout/layouts/Stack';
import CountdownTimer from '../../app/components/CountdownTimer';
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
import React from 'react';
import CommentCount from 'modules/comments/components/CommentCount';
import { usePollComments } from 'modules/comments/hooks/usePollComments';
import { useAccount } from 'modules/app/hooks/useAccount';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';

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

  return (
    <Box
      data-testid="poll-overview-card"
      aria-label="Poll overview"
      sx={{ variant: 'cards.primary', p: 0 }}
      {...props}
    >
      <ErrorBoundary componentName="Poll Card">
        <Box sx={{ p: [2, 4] }}>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: ['wrap', 'nowrap'] }}>
            <Stack gap={3}>
              {bpi === 0 && (
                <Box sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
                  <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                </Box>
              )}
              <Box sx={{ cursor: 'pointer' }}>
                <Box>
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Text as="p" variant="caps" sx={{ color: 'textSecondary', mb: 2 }}>
                      Posted {formatDateWithTime(poll.startDate)} | Poll ID {poll.pollId}
                    </Text>
                  </Flex>
                  <Link href={`/polling/${poll.slug}`} passHref>
                    <ThemeUILink variant="nostyle" title="View Poll Details">
                      <Text
                        variant="microHeading"
                        sx={{ fontSize: [3, 5] }}
                        data-testid="poll-overview-card-poll-title"
                      >
                        {poll.title}
                      </Text>
                    </ThemeUILink>
                  </Link>
                </Box>
                <Link href={`/polling/${poll.slug}`} passHref>
                  <ThemeUILink variant="nostyle" title="View Poll Details">
                    <Text
                      sx={{
                        fontSize: [2, 3],
                        color: 'textSecondary',
                        mt: 1
                      }}
                    >
                      {poll.summary}
                    </Text>
                  </ThemeUILink>
                </Link>
              </Box>

              <Flex>
                {poll.categories.map(c => (
                  <Box key={c} sx={{ marginRight: 2 }}>
                    <PollCategoryTag clickable={true} category={c} />
                  </Box>
                ))}
              </Flex>
              {bpi > 0 && (
                <Flex mb={1} sx={{ alignItems: 'center' }}>
                  <Box mr={2}>
                    <ErrorBoundary componentName="Countdown Timer">
                      <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                    </ErrorBoundary>
                  </Box>

                  {comments && comments.length > 0 && (
                    <ThemeUILink href={`/polling/${poll.slug}#comments`} title="View Comments">
                      <CommentCount count={comments.length} />
                    </ThemeUILink>
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
            </Stack>
            {showQuickVote && bpi > 0 && (
              <Box sx={{ ml: 2, minWidth: '265px' }}>
                <ErrorBoundary componentName="Vote in Poll">
                  <QuickVote poll={poll} showHeader={true} sx={{ maxWidth: 7 }} showStatus={!reviewPage} />
                </ErrorBoundary>
              </Box>
            )}
            {yourVote}
          </Flex>

          <Box>
            <Flex
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: ['column', 'row']
              }}
            >
              {!reviewPage && (
                <Flex
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: bpi > 0 ? 'auto' : '100%',
                    p: 0,
                    mt: 3
                  }}
                >
                  <Link
                    key={poll.slug}
                    href={{ pathname: '/polling/[poll-hash]' }}
                    as={{ pathname: `/polling/${poll.slug}` }}
                    passHref
                  >
                    <ThemeUILink variant="nostyle" title="View Poll Details">
                      <Button
                        variant="outline"
                        sx={{
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
                    </ThemeUILink>
                  </Link>
                </Flex>
              )}

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
              {poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE && !hideTally && (
                <Link href={`/polling/${poll.slug}/#vote-breakdown`} passHref>
                  <ThemeUILink variant="nostyle" title="View Vote Breakdown">
                    <Flex sx={{ alignItems: 'center', mt: 3 }}>
                      <Text variant="caps">Ranked-choice poll</Text>
                      <Icon name="stackedVotes" size={3} ml={2} />
                    </Flex>
                  </ThemeUILink>
                </Link>
              )}
              {poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE && !hideTally && (
                <Box sx={{ width: bpi > 0 ? '265px' : '100%', p: bpi > 0 ? 0 : 2 }}>
                  {tally && tally.totalMkrParticipation > 0 && (
                    <Link href={`/polling/${poll.slug}/#vote-breakdown`} passHref>
                      <ThemeUILink variant="nostyle" title="View Vote Breakdown">
                        <Box sx={{ mt: 3 }}>
                          <ErrorBoundary componentName="Poll Results">
                            <PollVotePluralityResultsCompact tally={tally} showTitles={false} />
                          </ErrorBoundary>
                        </Box>
                      </ThemeUILink>
                    </Link>
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
          <Box>
            <Divider my={0} />
            <ErrorBoundary componentName="Poll Winning Option">
              <PollWinningOptionBox tally={tally} poll={poll} />
            </ErrorBoundary>
          </Box>
        )}
      </ErrorBoundary>
    </Box>
  );
}
