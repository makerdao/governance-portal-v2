import React from 'react';
import { PluralityResult, Poll, PollTally, RankedChoiceResult } from '../types';
import { Flex } from 'theme-ui';
import { isActivePoll } from '../helpers/utils';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { getVoteColor } from '../helpers/getVoteColor';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import { StatusText } from 'modules/app/components/StatusText';

export default function PollWinningOptionBox({
  tally,
  poll
}: {
  poll: Poll;
  tally?: PollTally;
}): React.ReactElement {
  const textWin = isActivePoll(poll) ? 'Leading option' : 'Winning option';

  return (
    <Flex sx={{ py: 2, justifyContent: 'center' }}>
      {tally && tally.winningOptionName && tally.totalMkrParticipation > 0 ? (
        <StatusText>
          <>
            {textWin}:{' '}
            <span sx={{ color: getVoteColor(parseInt(tally?.winner || '0'), poll.voteType) }}>
              {tally?.winningOptionName}
            </span>{' '}
            {tally.pollVoteType === POLL_VOTE_TYPE.PLURALITY_VOTE &&
              'with ' +
                formatValue(
                  parseUnits(
                    (tally.results as PluralityResult[])
                      .find(({ optionId }) => optionId === tally.winner)
                      ?.mkrSupport.toString() || '0'
                  )
                ) +
                ' MKR supporting.'}
            {tally.pollVoteType === (POLL_VOTE_TYPE.RANKED_VOTE || POLL_VOTE_TYPE.UNKNOWN) &&
              'with ' +
                formatValue(
                  parseUnits(
                    (tally.results as RankedChoiceResult[])
                      .find(({ optionId }) => optionId === tally.winner)
                      ?.firstChoice.toString() || '0'
                  )
                ) +
                ' MKR supporting as first choice.'}
          </>
        </StatusText>
      ) : tally && !tally.winningOptionName ? (
        <StatusText>{isActivePoll(poll) ? 'No leading option' : 'No winning option'}</StatusText>
      ) : (
        <SkeletonThemed />
      )}
    </Flex>
  );
}
