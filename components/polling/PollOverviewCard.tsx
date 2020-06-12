/** @jsx jsx */
import Link from 'next/link';
import useSWR from 'swr';
import { Text, Flex, Divider, Box, Button, jsx } from 'theme-ui';

import useAccountsStore from '../../stores/accounts';
import getMaker, { getNetwork } from '../../lib/maker';
import Stack from '../layouts/Stack';
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
    <Flex
      sx={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        variant: 'cards.primary'
      }}
    >
      <Stack gap={2}>
        <Flex sx={{ justifyContent: 'space-between' }}>
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
        <Box>
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
            opacity: 0.8
          }}
        >
          {poll.summary}
        </Text>
        <div>
          <Divider mt={0} mx={-4} />
        </div>
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
            <Button variant={hasVoted ? 'outline' : 'primary'}>View Details</Button>
          </Link>
          <VotingStatus poll={poll} allUserVotes={allUserVotes} />
        </Flex>
      </Stack>
    </Flex>
  );
};

export default PollOverviewCard;
