/** @jsx jsx */
import { Flex, Box, Badge, jsx, Text } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';
import isNil from 'lodash/isNil';

import { isActivePoll } from '../../lib/utils';
import getMaker from '../../lib/maker';
import useAccountsStore from '../../stores/accounts';
import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';
import useBallotStore from '../../stores/ballot';
import useTransactionStore, { transactionsSelectors } from '../../stores/transactions';

const BadgeContents = ({ hasVoted, onBallot, poll, isMined, isPending, ...otherProps }) => {
  const color = hasVoted || onBallot ? 'linkHover' : 'badgeGrey';
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
    <Flex sx={{ alignItems: 'center', justifyContent: 'center' }} {...otherProps}>
      {icon && <Icon mr="1" name={icon} sx={{ color }} />}
      <Text variant="caps" color={color}>
        {text}
      </Text>
    </Flex>
  );
};

const VotingStatus = ({ poll, ...props }: { poll: Poll }): JSX.Element | null => {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? ['/user/voting-for', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );

  const [ballot, txId] = useBallotStore(state => [state.ballot, state.txId]);
  const onBallot = !isNil(ballot[poll.pollId]?.option);
  const transaction = useTransactionStore(state =>
    txId ? transactionsSelectors.getTransaction(state, txId) : null
  );
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
  return (
    <Box {...props}>
      <Badge
        px="14px"
        variant="primary"
        sx={{
          borderColor: hasVoted || onBallot ? 'linkHover' : 'badgeGrey',
          display: ['none', 'block']
        }}
      >
        {contents}
      </Badge>
      <Box sx={{ display: ['block', 'none'] }}>{contents}</Box>
    </Box>
  );
};

export default VotingStatus;
