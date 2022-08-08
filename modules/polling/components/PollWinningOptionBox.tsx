import React from 'react';
import { Poll, PollTally } from '../types';
import { Flex } from 'theme-ui';
import {
  isActivePoll,
  isInputFormatChooseFree,
  isInputFormatRankFree,
  isInputFormatSingleChoice
} from '../helpers/utils';
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
  tally: PollTally;
}): React.ReactElement {
  const textWin = isActivePoll(poll) ? 'Leading option' : 'Winning option';
  const isFinishedWithNoWinner = !tally.winner && !isActivePoll(poll);

  // Winner will be null if the winning conditions are not met, but we want to display the leading option too
  const leadingOption = typeof tally.winner === 'number' ? tally.winner : tally.results[0].optionId;
  const leadingOptionName =
    typeof tally.winner === 'number' ? tally.winningOptionName : tally.results[0].optionName;

  return (
    <Flex sx={{ py: 2, justifyContent: 'center' }}>
      <ErrorBoundary componentName="Winning option">
        {tally.totalMkrActiveParticipation > 0 ? (
          <>
            {isFinishedWithNoWinner && <StatusText>No winning option</StatusText>}

            {(isActivePoll(poll) || !isFinishedWithNoWinner) && (
              <StatusText>
                <>
                  {textWin}:{' '}
                  <span sx={{ color: getVoteColor(leadingOption, poll.parameters) }}>
                    {leadingOptionName}
                  </span>{' '}
                  {(isInputFormatSingleChoice(poll.parameters) || isInputFormatChooseFree(poll.parameters)) &&
                    'with ' +
                      formatValue(
                        parseUnits(
                          tally.results
                            .find(({ optionId }) => optionId === leadingOption)
                            ?.mkrSupport.toString() || '0'
                        )
                      ) +
                      ' MKR supporting.'}
                  {isInputFormatRankFree(poll.parameters) &&
                    'with ' +
                      formatValue(
                        parseUnits(
                          tally.results
                            .find(({ optionId }) => optionId === leadingOption)
                            ?.mkrSupport.toString() || '0'
                        )
                      ) +
                      ' MKR supporting as first choice.'}
                </>
              </StatusText>
            )}
          </>
        ) : (
          <StatusText>No participation.</StatusText>
        )}
      </ErrorBoundary>
    </Flex>
  );
}
