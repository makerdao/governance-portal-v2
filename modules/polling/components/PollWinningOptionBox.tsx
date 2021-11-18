import React from 'react';
import { Poll, PollTally } from '../types';
import { Text, Flex } from 'theme-ui';
import BigNumber from 'bignumber.js';
import Skeleton from 'react-loading-skeleton';
import { POLL_VOTE_TYPE } from '../polling.constants';
import { isActivePoll } from '../helpers/utils';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';

export default function PollWinningOptionBox({
  tally,
  poll
}: {
  poll: Poll;
  tally?: PollTally;
}): React.ReactElement {
  const colorYes = 'primary';
  const colorNo = 'notice';
  const colorOther = 'onSecondary';

  const colorOptionWin =
    poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE || !tally
      ? colorOther
      : tally.winner === '1'
      ? colorYes
      : tally.winner === '2'
      ? colorNo
      : colorOther;

  const textWin = isActivePoll(poll) ? 'Currently winning option' : 'Winner option';

  return (
    <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: colorOther }}>
      {tally && tally.winningOptionName ? (
        <Text as="p" sx={{ textAlign: 'center', px: [3, 4], mb: 1, wordBreak: 'break-word' }}>
          {textWin}: <span sx={{ color: colorOptionWin }}>{tally?.winningOptionName}</span> with{' '}
          {new BigNumber(tally.options[tally.winner].mkrSupport).toFormat(2)} MKR supporting.
        </Text>
      ) : (
        <SkeletonThemed />
      )}
    </Flex>
  );
}
