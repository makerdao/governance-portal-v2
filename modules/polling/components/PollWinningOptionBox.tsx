import React from 'react';
import { Poll, PollTally } from '../types';
import { Flex } from 'theme-ui';
import {
  isActivePoll,
  isInputFormatChooseFree,
  isInputFormatRankFree,
  isInputFormatSingleChoice
} from '../helpers/utils';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { getVoteColor } from '../helpers/getVoteColor';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import { StatusText } from 'modules/app/components/StatusText';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';

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
      <ErrorBoundary componentName="Winning option">
        {tally && tally.winningOptionName && tally.totalMkrParticipation > 0 ? (
          <StatusText>
            <>
              {textWin}:{' '}
              <span sx={{ color: getVoteColor(tally?.winner || 0, poll.parameters) }}>
                {tally?.winningOptionName}
              </span>{' '}
              {(isInputFormatSingleChoice(poll.parameters) || isInputFormatChooseFree(poll.parameters)) &&
                'with ' +
                  formatValue(
                    parseUnits(
                      tally.results
                        .find(({ optionId }) => optionId === tally.winner)
                        ?.mkrSupport.toString() || '0'
                    )
                  ) +
                  ' MKR supporting.'}
              {isInputFormatRankFree(poll.parameters) &&
                'with ' +
                  formatValue(
                    parseUnits(
                      tally.results
                        .find(({ optionId }) => optionId === tally.winner)
                        ?.mkrSupport.toString() || '0'
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
      </ErrorBoundary>
    </Flex>
  );
}
