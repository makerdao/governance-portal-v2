/** @jsx jsx */
import { Flex, Box, Badge, jsx } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';

import { isActivePoll } from '../../lib/utils';
import getMaker from '../../lib/maker';
import useAccountsStore from '../../stores/accounts';
import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';
import useBallotStore from '../../stores/ballot';

const BadgeContents = ({hasVoted, onBallot, poll, ...otherProps}) => {
  return (
  <div {...otherProps}>
    {hasVoted ? (
      <Flex sx={{ alignItems: 'center' }}>
          <Icon mr="1" name="verified" sx={{ color: 'linkHover' }} />
          You Voted
      </Flex>
        ) : 
        onBallot ?
        (
          <Flex sx={{ alignItems: 'center' }}>
          <Icon mr="1" name="ballot" sx={{ color: 'linkHover' }} />
          On Your Ballot
          </Flex>
        ) :
        (
        <div>
          {isActivePoll(poll) ? 'You have not voted': 'You did not vote'} 
        </div>
      )}
    </div>
    );
}

const VotingStatus = ({ poll, ...otherProps }: { poll: Poll }) => {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? [`/user/voting-for`, account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );

  const ballot = useBallotStore(state => state.ballot);
  const onBallot = !!ballot[poll.pollId]?.option;

  if (!account) return null;
  if (!allUserVotes)
    return (
      <Box ml="3" sx={{ width: '160px' }} {...otherProps}>
        <Skeleton />
      </Box>
    );

  const hasVoted = !!allUserVotes?.find(pollVote => pollVote.pollId === poll.pollId);
  return (
    <Flex sx={{ alignItems: 'center' }} {...otherProps}>
      <Badge
          ml="3"
          px="14px"
          variant="primary"
          sx={{
          borderColor: hasVoted || onBallot ? 'linkHover': 'badgeGrey',
          color: hasVoted || onBallot ? 'linkHover': 'badgeGrey',
          textTransform: 'uppercase',
          display: ['none', 'block']
          }}
      >
        <BadgeContents hasVoted={hasVoted} onBallot={onBallot} poll={poll}/>
      </Badge>
      <BadgeContents sx={{
        fontSize: '2',
        color: hasVoted || onBallot ? 'linkHover': 'badgeGrey',
        textTransform: 'uppercase',
        display: ['block', 'none']
        }} hasVoted={hasVoted} onBallot={onBallot} poll={poll}/>
    </Flex>
  );
};

export default VotingStatus;
