import { Box, Text, Flex } from 'theme-ui';
import useSWR from 'swr';
import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';
import Ballot from '../../types/ballot';
import getMaker from '../../lib/maker';
import { isActivePoll, findPollById } from '../../lib/utils';
import useAccountsStore from '../../stores/accounts';

type Props = { ballot: Ballot; polls: Poll[]; activePolls: Poll[] };

export default function ({ ballot, polls, activePolls }: Props): JSX.Element {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? ['/user/voting-for', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );
  const allUserPolls = allUserVotes
    ? allUserVotes.map(vote => findPollById(polls, vote.pollId.toString()))
    : [];
  const allUserVotesActive = allUserPolls.filter(poll => (poll ? isActivePoll(poll) : false));
  const availablePollsLength = activePolls.length - allUserVotesActive.length;

  return (
    <Box p={3} sx={{ borderBottom: '1px solid secondaryMuted' }}>
      <Text sx={{ color: 'onSurface', fontSize: 16, fontWeight: '500' }}>
        {`${Object.keys(ballot).length} of ${availablePollsLength} available polls added to ballot`}
      </Text>
      <Flex
        sx={{
          width: '100%',
          height: 2,
          backgroundColor: 'muted',
          mt: 2,
          flexDirection: 'row',
          borderRadius: 'small'
        }}
      >
        {Array(availablePollsLength)
          .fill(null)
          .map((_, index) => (
            <Box
              key={index}
              backgroundColor="muted"
              sx={{
                flex: 1,
                borderLeft: index === 0 ? null : '1px solid white',
                borderTopLeftRadius: index === 0 ? 'small' : null,
                borderBottomLeftRadius: index === 0 ? 'small' : null,
                borderTopRightRadius: index === availablePollsLength - 1 ? 'small' : null,
                borderBottomRightRadius: index === availablePollsLength - 1 ? 'small' : null,
                backgroundColor: index < Object.keys(ballot).length ? 'primary' : null
              }}
            />
          ))}
      </Flex>
    </Box>
  );
}
