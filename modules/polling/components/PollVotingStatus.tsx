import { Flex, Box, Badge, Text, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { Icon } from '@makerdao/dai-ui-icons';
import isNil from 'lodash/isNil';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import useAccountsStore from 'modules/app/stores/accounts';
import useBallotStore from 'modules/polling/stores/ballotStore';
import useTransactionStore, { transactionsSelectors } from 'modules/app/stores/transactions';
import { Poll } from 'modules/polling/types';

const BadgeContents = ({ hasVoted, onBallot, poll, isMined, isPending, option, ...otherProps }) => {
  const color = hasVoted || onBallot ? 'greenLinkHover' : 'textMuted';
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
      {icon && <Icon mr="2" name={icon} sx={{ color }} />}
      <Text variant="caps" color={color}>
        {text}
      </Text>
    </Flex>
  );
};

const VotingStatus = ({ poll, ...props }: { poll: Poll; sx?: ThemeUIStyleObject }): JSX.Element | null => {
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
      option={ballot[poll.pollId]?.option}
      isMined={isMined}
      isPending={isPending}
    />
  );
  return <Box {...props}>{contents}</Box>;
};

export default VotingStatus;
