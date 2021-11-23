import React from 'react';
import { Poll, PollTally } from '../types';
import { Text, Flex } from 'theme-ui';
import BigNumber from 'bignumber.js';
import { isActivePoll } from '../helpers/utils';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { getVoteColor } from '../helpers/getVoteColor';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';

export default function PollWinningOptionBox({
  tally,
  poll
}: {
  poll: Poll;
  tally?: PollTally;
}): React.ReactElement {
  const textWin = isActivePoll(poll) ? 'Leading option' : 'Winning option';

  return (
    <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
      {tally && tally.winningOptionName ? (
        <Text as="p" sx={{ textAlign: 'center', px: [3, 4], mb: 1, wordBreak: 'break-word' }}>
          {textWin}:{' '}
          <span sx={{ color: getVoteColor(parseInt(tally.winner), poll.voteType) }}>
            {tally?.winningOptionName}
          </span>{' '}
          {tally.pollVoteType === POLL_VOTE_TYPE.PLURALITY_VOTE &&
            'with ' + new BigNumber(tally.options[tally.winner].mkrSupport).toFormat(2) + ' MKR supporting.'}
          {tally.pollVoteType === (POLL_VOTE_TYPE.RANKED_VOTE || POLL_VOTE_TYPE.UNKNOWN) &&
            'with ' +
              new BigNumber(tally.options[tally.winner].firstChoice).toFormat(2) +
              ' MKR supporting as first choice.'}
        </Text>
      ) : (
        <SkeletonThemed />
      )}
    </Flex>
  );
}
