/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React from 'react';
import { Poll, PollTally, PollVictoryConditionComparison } from '../types';
import { Flex } from 'theme-ui';
import {
  isActivePoll,
  isInputFormatChooseFree,
  isInputFormatRankFree,
  isInputFormatSingleChoice,
  findVictoryCondition
} from '../helpers/utils';
import { getVoteColor } from '../helpers/getVoteColor';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import { StatusText } from 'modules/app/components/StatusText';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { PollVictoryConditions } from '../polling.constants';
import { BigNumber } from 'ethers';

export default function PollWinningOptionBox({
  tally,
  poll
}: {
  poll: Poll;
  tally: PollTally;
}): React.ReactElement {
  const isFinishedWithNoWinner = !tally.winner && !isActivePoll(poll);

  const numberOfLeadingOptions = tally.results.filter(
    result => BigNumber.from(tally.results[0].mkrSupport).gt(0) &&  result.mkrSupport === tally.results[0].mkrSupport
  ).length;

  // Winner will be null if the winning conditions are not met, but we want to display the leading option too
  const leadingOption = typeof tally.winner === 'number' ? tally.winner : tally.results[0].optionId;
  const leadingOptionName = `${
    typeof tally.winner === 'number' ? tally.winningOptionName : tally.results[0].optionName
  }${numberOfLeadingOptions > 1 ? ` & ${numberOfLeadingOptions - 1} more` : ''}`;

  const winningVictoryCondition = tally.parameters.victoryConditions.find(
    (v, index) => index === tally.victoryConditionMatched
  );

  let textWin = isActivePoll(poll) ? 'Leading option' : 'Winning option';
  let isDefault = false;

  const hasComparison = findVictoryCondition(
    poll.parameters.victoryConditions,
    PollVictoryConditions.comparison
  ) as PollVictoryConditionComparison[];

  const comparisonText =
    hasComparison.length > 0 &&
    hasComparison[0].comparator === '>=' &&
    ` Requires ${formatValue(parseUnits(hasComparison[0].value.toString()))} MKR participation. `;

  if (winningVictoryCondition && winningVictoryCondition.type === PollVictoryConditions.default) {
    textWin = `No winner condition met.${comparisonText ? comparisonText : ' '}Defaulting to`;
    isDefault = true;
  }

  return (
    <Flex sx={{ py: 2, justifyContent: 'center' }}>
      <ErrorBoundary componentName="Winning option">
        {tally.totalMkrActiveParticipation > 0 ||
        (winningVictoryCondition && winningVictoryCondition.type === PollVictoryConditions.default) ? (
          <>
            {isFinishedWithNoWinner && <StatusText>No winning option</StatusText>}

            {(isActivePoll(poll) || !isFinishedWithNoWinner) && (
              <StatusText>
                <>
                  {textWin}:{' '}
                  <span sx={{ color: getVoteColor(leadingOption, poll.parameters) }}>
                    {leadingOptionName}
                  </span>
                  {!isDefault &&
                    (isInputFormatSingleChoice(poll.parameters) ||
                      isInputFormatChooseFree(poll.parameters)) &&
                    ' with ' +
                      formatValue(
                        parseUnits(
                          tally.results
                            .find(({ optionId }) => optionId === leadingOption)
                            ?.mkrSupport.toString() || '0'
                        )
                      ) +
                      ' MKR supporting.'}
                  {!isDefault &&
                    isInputFormatRankFree(poll.parameters) &&
                    ' with ' +
                      formatValue(
                        parseUnits(
                          tally.results
                            .find(({ optionId }) => optionId === leadingOption)
                            ?.mkrSupport.toString() || '0'
                        )
                      ) +
                      ' MKR supporting as first choice.'}
                  {isDefault && '.'}
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
