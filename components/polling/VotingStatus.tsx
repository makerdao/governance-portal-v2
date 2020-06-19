/** @jsx jsx */
import { Text, Flex, Box, jsx } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';

import { isActivePoll } from '../../lib/utils';
import getMaker from '../../lib/maker';
import useAccountsStore from '../../stores/accounts';
import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';

const VotingStatus = ({ poll, ...otherProps }: { poll: Poll }) => {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? [`/user/voting-for`, account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );

  if (!account) return null;
  if (!allUserVotes)
    return (
      <Box sx={{ width: 6 }} {...otherProps}>
        <Skeleton />
      </Box>
    );

  const hasVoted = !!allUserVotes?.find(pollVote => pollVote.pollId === poll.pollId);
  return (
    <Text
      sx={{
        alignItems: 'cetner',
        color: hasVoted ? 'primary' : 'text'
      }}
      {...otherProps}
    >
      {hasVoted ? (
        <Flex sx={{ alignItems: 'center' }}>
          <Icon name="checkmark" color="primary" sx={{ mr: 2 }} />
          {isActivePoll(poll) ? `You're currently voting on this poll` : `You voted in this poll`}
        </Flex>
      ) : isActivePoll(poll) ? (
        'You did not vote in this poll'
      ) : (
        'You have not yet voted'
      )}
    </Text>
  );
};

export default VotingStatus;
