import Link from 'next/link';
import { Text, Flex, Box, Button, Link as InternalLink, ThemeUIStyleObject, Divider } from 'theme-ui';

import { isActivePoll } from 'modules/polling/helpers/utils';
import { getNetwork } from 'lib/maker';
import Stack from '../../app/components/layout/layouts/Stack';
import CountdownTimer from '../../app/components/CountdownTimer';
import VotingStatus from './PollVotingStatus';
import { Poll } from 'modules/polling/types';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useAccountsStore from 'modules/app/stores/accounts';
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

type Props = {
  poll: Poll;
  reviewPage: boolean;
  sx?: ThemeUIStyleObject;
  showVoting?: boolean;
  children?: React.ReactNode;
};
export default function PollOverviewCard({
  poll,
  reviewPage,
  showVoting,
  children,
  ...props
}: Props): JSX.Element {
  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const canVote = !!account && isActivePoll(poll);
  const showQuickVote = canVote && showVoting;
  const { comments } = usePollComments(poll.pollId);

  const { tally } = usePollTally(poll.pollId);

  return (
    <Box aria-label="Poll overview" sx={{ variant: 'cards.primary', p: 0 }} {...props}>
      <Box sx={{ p: [2, 4] }}>
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Stack gap={3}>
            {bpi === 0 && (
              <Box sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
                <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
              </Box>
            )}
            <Box sx={{ cursor: 'pointer' }}>
              <Box>
                <Text as="p" variant="caps" sx={{ color: 'textSecondary', mb: 2 }}>
                  Posted on {formatDateWithTime(poll.startDate)}{' '}
                </Text>
                <Link href={`/polling/${poll.slug}?network=${network}`} passHref>
                  <InternalLink variant="nostyle">
                    <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                      {poll.title}
                    </Text>
                  </InternalLink>
                </Link>
              </Box>
              <Link href={`/polling/${poll.slug}?network=${network}`} passHref>
                <InternalLink variant="nostyle">
                  <Text
                    sx={{
                      fontSize: [2, 3],
                      color: 'textSecondary',
                      mt: 1
                    }}
                  >
                    {poll.summary}
                  </Text>
                </InternalLink>
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
              <Flex mb={1}>
                <Box mr={2}>
                  <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                </Box>

                {comments && comments.length > 0 && (
                  <InternalLink href={`/polling/${poll.slug}?network=${getNetwork()}#comments`}>
                    <CommentCount count={comments.length} />
                  </InternalLink>
                )}
              </Flex>
            )}
          </Stack>
          {showQuickVote && bpi > 0 && (
            <Box sx={{ ml: 2, minWidth: '265px' }}>
              <QuickVote
                poll={poll}
                showHeader={true}
                account={account}
                sx={{ maxWidth: 7 }}
                showStatus={!reviewPage}
              />
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
              <Link
                key={poll.slug}
                href={{ pathname: '/polling/[poll-hash]', query: { network } }}
                as={{ pathname: `/polling/${poll.slug}`, query: { network } }}
              >
                <InternalLink href={`/polling/${poll.slug}`} variant="nostyle">
                  <Button
                    variant="outline"
                    sx={{
                      display: reviewPage ? 'none' : undefined,
                      borderColor: 'onSecondary',
                      color: 'secondaryAlt',
                      borderRadius: 'small',
                      ':hover': { color: 'text', borderColor: 'onSecondary', backgroundColor: 'background' }
                    }}
                  >
                    View Details
                  </Button>
                </InternalLink>
              </Link>
            </Flex>

            {showQuickVote && bpi === 0 && (
              <Box sx={{ mt: 3, width: '100%' }}>
                <VotingStatus poll={poll} />
                <QuickVote poll={poll} showHeader={false} account={account} showStatus={!reviewPage} />
              </Box>
            )}

            {poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE && (
              <Box sx={{ width: bpi > 0 ? '265px' : '100%', p: bpi > 0 ? 0 : 2 }}>
                {tally && tally.totalMkrParticipation > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <PollVotePluralityResultsCompact tally={tally} showTitles={false} />
                  </Box>
                )}
                {!tally && <SkeletonThemed width={'265px'} height={'30px'} />}
              </Box>
            )}
          </Flex>
        </Box>

        {children && <Box>{children}</Box>}
      </Box>

      {tally && tally.totalMkrParticipation > 0 && (
        <Box>
          <Divider my={0} />
          <PollWinningOptionBox tally={tally} poll={poll} />
        </Box>
      )}
    </Box>
  );
}
