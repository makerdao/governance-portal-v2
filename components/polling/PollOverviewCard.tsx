/** @jsx jsx */
import Link from 'next/link';
import useSWR from 'swr';
import { NavLink, Text, Flex, Divider, Box, jsx } from 'theme-ui';

import useAccountsStore from '../../stores/accounts';
import getMaker, { getNetwork } from '../../lib/maker';
import CountdownTimer from '../CountdownTimer';
import VotingStatus from './VotingStatus';
import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';

const PollOverviewCard = ({ poll }: { poll: Poll }) => {
  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? [`/user/voting-for`, account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address))
  );

  const hasVoted = !!allUserVotes?.find(pollVote => pollVote.pollId === poll.pollId);
  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        variant: 'cards.primary'
      }}
    >
      <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between' }}>
        <Flex mb={2} sx={{ justifyContent: 'space-between' }}>
          <Text
            sx={{
              fontSize: [2, 3],
              color: 'mutedAlt',
              textTransform: 'uppercase'
            }}
          >
            Posted{' '}
            {new Date(poll.startDate).toLocaleString('default', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
        </Flex>
        <Box mb={2}>
          <Link
            href={{
              pathname: '/polling/[poll-hash]',
              query: { network }
            }}
            as={{
              pathname: `/polling/${poll.slug}`,
              query: { network }
            }}
          >
            <Text
              sx={{
                fontSize: [3, 4]
              }}
            >
              {poll.title}
            </Text>
          </Link>
        </Box>
        <Text
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: [3, 4],
            color: 'primaryText',
            opacity: 0.8
          }}
        >
          {poll.summary}
        </Text>
      </Flex>
      <Divider my={3} mx={-4} sx={{ color: 'muted' }} />
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          key={poll.slug}
          href={{
            pathname: '/polling/[poll-hash]',
            query: { network }
          }}
          as={{
            pathname: `/polling/${poll.slug}`,
            query: { network }
          }}
        >
          <NavLink variant={hasVoted ? 'buttons.outline' : 'buttons.primary'}>View Details</NavLink>
        </Link>
        <VotingStatus poll={poll} allUserVotes={allUserVotes} />
      </Flex>
    </div>
  );
};

export default PollOverviewCard;
