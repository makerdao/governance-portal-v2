/** @jsx jsx */
import Link from 'next/link';
import { Text, Flex, Box, Button, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import isNil from 'lodash/isNil';

import { isActivePoll } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';
import Stack from '../layouts/Stack';
import CountdownTimer from '../CountdownTimer';
import VotingStatus from './VotingStatus';
import Poll from '../../types/poll';
import PollOptionBadge from '../PollOptionBadge';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useAccountsStore from '../../stores/accounts';
import useBallotStore from '../../stores/ballot';
import QuickVote from './QuickVote';

type Props = { poll: Poll; startMobileVoting?: () => void; reviewing: boolean; sending: null | string };
export default function PollOverviewCard({
  poll,
  startMobileVoting,
  reviewing,
  sending,
  ...props
}: Props): JSX.Element {
  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex();
  const canVote = !!account && isActivePoll(poll);
  const showQuickVote = canVote && bpi > 0;
  const ballot = useBallotStore(state => state.ballot);
  const onBallot = !isNil(ballot[poll.pollId]?.option);

  return (
    <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', variant: 'cards.primary' }} {...props}>
      <Stack gap={2}>
        {bpi === 0 && (
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
            <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
            <VotingStatus poll={poll} />
          </Flex>
        )}
        <Box>
          <Link
            href={{ pathname: '/polling/[poll-hash]', query: { network } }}
            as={{ pathname: `/polling/${poll.slug}`, query: { network } }}
          >
            <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
              {poll.title}
            </Text>
          </Link>
        </Box>
        <Text
          sx={{
            fontSize: [2, 3],
            color: 'onSecondary'
          }}
        >
          {poll.summary}
        </Text>
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
                onClick={startMobileVoting}
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
              <Button variant="primary" mr={2} onClick={startMobileVoting}>
                Vote
              </Button>
            ))}
          <Link
            key={poll.slug}
            href={{ pathname: '/polling/[poll-hash]', query: { network } }}
            as={{ pathname: `/polling/${poll.slug}`, query: { network } }}
          >
            <Button
              variant="outline"
              sx={{
                display: reviewing ? 'none' : null,
                borderColor: 'secondaryAlt',
                color: 'secondaryAlt'
              }}
            >
              View Details
            </Button>
          </Link>
          {isActivePoll(poll) ? '' : <PollOptionBadge poll={poll} sx={{ color: 'mutedAlt' }} />}
          <VotingStatus sx={{ display: reviewing ? 'none' : ['none', 'block'], ml: 3 }} poll={poll} />
        </Flex>
      </Stack>
      {showQuickVote && (
        <QuickVote poll={poll} sending={sending} showHeader={true} sx={{ maxWidth: 7, ml: 5 }} />
      )}
    </Flex>
  );
}
