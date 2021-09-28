/** @jsx jsx */
import { Flex, Box, Badge, jsx, Text, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'components/SkeletonThemed';
import { Icon } from '@makerdao/dai-ui-icons';
import isNil from 'lodash/isNil';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { useAllUserVotes } from 'lib/hooks';
import useAccountsStore from 'stores/accounts';
import useBallotStore from 'stores/ballot';
import useTransactionStore, { transactionsSelectors } from 'stores/transactions';
import { Poll } from 'modules/polling/types';

const BadgeContents = ({ hasVoted, onBallot, poll, isMined, isPending, ...otherProps }) => {
  const color = hasVoted || onBallot ? 'greenLinkHover' : 'badgeGrey';
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
      {icon && <Icon mr="2" name={icon} sx={{ color }} />}
      <Text variant="caps" color={color}>
        {text}
      </Text>
    </Flex>
  );
};

const VotingStatus = ({
  poll,
  desktopStyle,
  ...props
}: {
  poll: Poll;
  desktopStyle?: boolean;
  sx?: ThemeUIStyleObject;
}): JSX.Element | null => {
  const account = useAccountsStore(state => state.currentAccount);
  const voteDelegate = useAccountsStore(state => (account ? state.voteDelegate : null));
  const addressToCheck = voteDelegate ? voteDelegate.getVoteDelegateAddress() : account?.address;
  const { data: allUserVotes } = useAllUserVotes(addressToCheck);

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
          borderColor: hasVoted || onBallot ? 'greenLinkHover' : 'badgeGrey',
          display: desktopStyle ? 'block' : ['none', 'block']
        }}
      >
        {contents}
      </Badge>
      <Box sx={{ display: desktopStyle ? 'none' : ['block', 'none'] }}>{contents}</Box>
    </Box>
  );
};

export default VotingStatus;
