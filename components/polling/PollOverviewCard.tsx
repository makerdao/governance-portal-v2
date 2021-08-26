/** @jsx jsx */
import Link from 'next/link';
import { Text, Flex, Box, Button, Link as InternalLink, jsx, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import isNil from 'lodash/isNil';

import { isActivePoll } from 'lib/utils';
import { getNetwork } from 'lib/maker';
import Stack from '../layouts/Stack';
import CountdownTimer from '../CountdownTimer';
import VotingStatus from './PollVotingStatus';
import { Poll } from 'modules/polls/types';
import PollOptionBadge from '../PollOptionBadge';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useAccountsStore from 'stores/accounts';
import useBallotStore from 'stores/ballot';
import QuickVote from './QuickVote';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';

type Props = {
  poll: Poll;
  startMobileVoting?: () => void;
  reviewPage: boolean;
  sx?: ThemeUIStyleObject;
};
export default function PollOverviewCard({
  poll,
  startMobileVoting,
  reviewPage,
  ...props
}: Props): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);

  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const canVote = !!account && isActivePoll(poll);
  const showQuickVote = canVote && bpi > 0;
  const ballot = useBallotStore(state => state.ballot);
  const onBallot = !isNil(ballot[poll.pollId]?.option);

  return (
    <Flex
      aria-label="Poll overview"
      sx={{ flexDirection: 'row', justifyContent: 'space-between', variant: 'cards.primary' }}
      {...props}
    >
      <Stack gap={3}>
        {bpi === 0 && (
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
            <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
            <VotingStatus poll={poll} />
          </Flex>
        )}
        <Box sx={{ cursor: 'pointer' }}>
          <Box>
            <Link
              href={{ pathname: '/polling/[poll-hash]', query: { network } }}
              as={{ pathname: `/polling/${poll.slug}`, query: { network } }}
            >
              <InternalLink href={`/polling/${poll.slug}`} variant="nostyle">
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {poll.title}
                </Text>
              </InternalLink>
            </Link>
          </Box>
          <Link
            href={{ pathname: '/polling/[poll-hash]', query: { network } }}
            as={{ pathname: `/polling/${poll.slug}`, query: { network } }}
          >
            <InternalLink href={`/polling/${poll.slug}`} variant="nostyle">
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

        {bpi > 0 && (
          <div>
            <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
          </div>
        )}
        <Flex sx={{ alignItems: 'center' }}>
          {canVote &&
            bpi === 0 &&
            (onBallot ? (
              <Button
                variant="outline"
                mr={2}
                onClick={() => {
                  trackButtonClick('showHistoricalPolls');
                  startMobileVoting && startMobileVoting();
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  alignItems: 'center'
                }}
              >
                <Icon name="edit" size={3} mr={2} />
                Edit Choices
              </Button>
            ) : (
              <Button
                variant="primary"
                mr={2}
                px={4}
                onClick={() => {
                  trackButtonClick('startMobileVoting');
                  startMobileVoting && startMobileVoting();
                }}
              >
                Vote
              </Button>
            ))}
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
          {isActivePoll(poll) ? '' : <PollOptionBadge poll={poll} sx={{ ml: 3, color: 'text' }} />}
          <VotingStatus sx={{ display: reviewPage ? 'none' : ['none', 'block'], ml: 3 }} poll={poll} />
        </Flex>
      </Stack>
      {showQuickVote && (
        <QuickVote poll={poll} showHeader={true} account={account} sx={{ maxWidth: 7, ml: 5 }} />
      )}
    </Flex>
  );
}
