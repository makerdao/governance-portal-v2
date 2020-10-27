/** @jsx jsx */
import { Box, Text, Flex, jsx } from 'theme-ui';
import isEqual from 'lodash/isEqual';
import useSWR from 'swr';

import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';
import Ballot from '../../types/ballot';
import getMaker from '../../lib/maker';
import { isActivePoll, findPollById } from '../../lib/utils';
import useAccountsStore from '../../stores/accounts';

type Props = { ballot: Ballot; polls: Poll[]; activePolls: Poll[] };

export default function PollBar({ ballot, polls, activePolls, ...props }: Props): JSX.Element {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? ['/user/voting-for', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );
  const allUserPolls: Poll[] = allUserVotes
    ? allUserVotes
        .map(vote => findPollById(polls, vote.pollId.toString()))
        .filter((vote): vote is Poll => Boolean(vote))
    : [];

  const allUserVotesActive = allUserPolls.filter(poll => isActivePoll(poll));
  const availablePollsLength = activePolls.length - allUserVotesActive.length;

  const edits = Object.keys(ballot).filter(pollId => {
    const existingVote = allUserVotes?.find(vote => vote.pollId === parseInt(pollId));
    if (existingVote) {
      return existingVote.rankedChoiceOption
        ? !isEqual(existingVote.rankedChoiceOption, ballot[pollId].option)
        : !isEqual(existingVote.option, ballot[pollId].option);
    }
    return false;
  }).length;

  return availablePollsLength > 0 || edits > 0 ? (
    <Box p={3} sx={{ borderBottom: '1px solid secondaryMuted' }} {...props}>
      <Text sx={{ color: 'textSecondary', fontSize: 3 }}>
        {`${Object.keys(ballot).length - edits} of ${availablePollsLength} available polls added to ballot`}
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
                backgroundColor: index < Object.keys(ballot).length - edits ? 'primary' : null
              }}
            />
          ))}
      </Flex>
      {edits > 0 && (
        <Box mt={2} mb={-2}>
          <Text sx={{ color: 'textSecondary', fontWeight: 'semiBold' }}>
            <strong sx={{ color: 'text', fontWeight: 'bold' }}>and {edits}</strong> vote edit
            {edits > 1 && 's'} added to ballot.
          </Text>
        </Box>
      )}
    </Box>
  ) : (
    <Box pt={3} px={3} pb={2} sx={{ color: 'primary' }}>
      All polls complete
    </Box>
  );
}
