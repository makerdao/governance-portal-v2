import { Flex, Box, Text, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { Icon } from '@makerdao/dai-ui-icons';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import { Poll } from 'modules/polling/types';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';

const BadgeContents = ({ hasVoted, onBallot, poll, isMined, isPending, ...otherProps }) => {
  const color = hasVoted || onBallot ? 'primary' : 'textSecondary';
  const icon = hasVoted ? 'verified' : onBallot ? 'ballot' : null;
  const text = hasVoted
    ? 'You voted'
    : onBallot
    ? isMined
      ? 'You voted'
      : isPending
      ? 'Vote pending'
      : 'Added to ballot'
    : isActivePoll(poll)
    ? 'You have not voted'
    : 'You did not vote';

  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'flex-start' }} {...otherProps}>
      <Text variant="caps" color={color}>
        {text}
      </Text>
      {icon && <Icon ml="2" name={icon} sx={{ color }} />}
    </Flex>
  );
};

const VotingStatus = ({ poll, ...props }: { poll: Poll; sx?: ThemeUIStyleObject }): JSX.Element | null => {
  const { account, voteDelegateContractAddress } = useAccount();
  const { data: allUserVotes } = useAllUserVotes(
    voteDelegateContractAddress ? voteDelegateContractAddress : account
  );
  const { transaction, isPollOnBallot } = useContext(BallotContext);

  const onBallot = isPollOnBallot(poll.pollId);

  const isMined = transaction?.status === 'mined';
  const isPending = transaction?.status === 'pending';

  if (!account) return null;
  if (!allUserVotes)
    return (
      <Box ml="3" sx={{ width: '160px' }} {...props}>
        <Skeleton />
      </Box>
    );

  const hasVoted = !!allUserVotes?.find(pollVote => pollVote.pollId === poll.pollId);
  const contents = (
    <BadgeContents
      hasVoted={hasVoted}
      onBallot={onBallot}
      poll={poll}
      isMined={isMined}
      isPending={isPending}
    />
  );
  return <Box {...props}>{contents}</Box>;
};

export default VotingStatus;
