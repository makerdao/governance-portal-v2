/** @jsx jsx */
import { Text, Flex, Box, Badge, jsx } from 'theme-ui';
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

  //todo: set onBallot properly, don't use a mock value
  const onBallot = false;

  if (!account) return null;
  if (!allUserVotes)
    return (
      <Box sx={{ width: 6, ml: '32px' }} {...otherProps}>
        <Skeleton />
      </Box>
    );

  const hasVoted = !!allUserVotes?.find(pollVote => pollVote.pollId === poll.pollId);
  return (
    <Flex sx={{ alignItems: 'center'}}>
      {hasVoted ? (
      <Badge
          mx="3"
          px="14px"
          variant="primary"
          sx={{
          borderColor: 'linkHover',
          color: 'linkHover',
          textTransform: 'uppercase'
          }}
      >
          <Flex sx={{ alignItems: 'center' }}>
              <Icon mr="1" name="verified" sx={{ color: 'linkHover' }} />
              You Voted
          </Flex>
      </Badge>
      ) : 
      onBallot ?
      (
      <Badge
          mx="3"
          px="14px"
          variant="primary"
          sx={{
          borderColor: 'linkHover',
          color: 'linkHover',
          textTransform: 'uppercase'
          }}
      >
          On Your Ballot
      </Badge>
      ) :
      (
          <Badge
          mx="3"
          px="14px"
          variant="primary"
          sx={{
          borderColor: 'badgeGrey',
          color: 'badgeGrey',
          textTransform: 'uppercase'
          }}
      >
          {isActivePoll(poll) ? 'You have not voted': 'You did not vote'} 
      </Badge>
      )}
    </Flex>
  );
};

export default VotingStatus;
