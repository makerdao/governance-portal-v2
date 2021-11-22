import React from 'react';
import { Poll, PollTally } from '../types';
import { Text, Flex } from 'theme-ui';
import BigNumber from 'bignumber.js';
import { isActivePoll } from '../helpers/utils';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { getVoteColor } from '../helpers/getVoteColor';

export default function PollWinningOptionBox({
  tally,
  poll
}: {
  poll: Poll;
  tally?: PollTally;
}): React.ReactElement {
  const textWin = isActivePoll(poll) ? 'Currently winning option' : 'Winning option';

  return (
    <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
      {tally && tally.winningOptionName ? (
        <Text as="p" sx={{ textAlign: 'center', px: [3, 4], mb: 1, wordBreak: 'break-word' }}>
          {textWin}:{' '}
          <span sx={{ color: getVoteColor(parseInt(tally.winner), poll.voteType) }}>
            {tally?.winningOptionName}
          </span>{' '}
          with {new BigNumber(tally.options[tally.winner].mkrSupport).toFormat(2)} MKR supporting.
        </Text>
      ) : (
        <SkeletonThemed />
      )}
    </Flex>
  );
}
