/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Text, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Icon from 'modules/app/components/Icon';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import { Poll, PollListItem } from 'modules/polling/types';
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
      {icon && <Icon name={icon} sx={{ color, ml: 2 }} />}
    </Flex>
  );
};

const VotingStatus = ({
  poll,
  ...props
}: {
  poll: PollListItem | Poll;
  sx?: ThemeUIStyleObject;
}): JSX.Element | null => {
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
