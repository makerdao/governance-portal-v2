/** @jsx jsx */
import { Text, Flex, Box, jsx } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';
import { Icon } from '@makerdao/dai-ui-icons';

import useAccountsStore from '../../stores/accounts';
import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';

const VotingStatus = ({ poll, allUserVotes }: { poll: Poll; allUserVotes?: PollVote[] }) => {
  const account = useAccountsStore(state => state.currentAccount);

  if (!account) return null;
  if (!allUserVotes)
    return (
      <Box sx={{ width: 6 }}>
        <Skeleton />
      </Box>
    );

  const hasVoted = !!allUserVotes?.find(pollVote => pollVote.pollId === poll.pollId);
  const hasPollEnded = new Date(poll.endDate).getTime() < new Date().getTime();
  return (
    <Text
      sx={{
        alignItems: 'cetner',
        color: hasVoted ? 'primary' : 'text'
      }}
    >
      {hasVoted ? (
        <Flex sx={{ alignItems: 'center' }}>
          {hasPollEnded ? null : <Icon name="checkmark" color="primary" sx={{ mr: 2 }} />} You voted in this
          poll
        </Flex>
      ) : hasPollEnded ? (
        'You did not vote in this poll'
      ) : (
        'You have not yet voted'
      )}
    </Text>
  );
};

export default VotingStatus;
