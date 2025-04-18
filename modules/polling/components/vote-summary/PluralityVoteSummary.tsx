/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { parseEther } from 'viem';
import { formatValue } from 'lib/string';
import { Box } from 'theme-ui';
import { PollTally } from '../../types';
import { YesNoAbstainBar } from '../YesNoAbstainBar';

export function PluralityVoteSummary({
  tally,
  showTitles = true
}: {
  tally: PollTally;
  showTitles?: boolean;
}): React.ReactElement {
  const voteTallyResults = tally.results;

  const yesPercent = voteTallyResults.find(({ optionId }) => optionId === 1)?.firstPct || 0;
  const abstainPercent = voteTallyResults.find(({ optionId }) => optionId === 0)?.firstPct || 0;
  const noPercent = voteTallyResults.find(({ optionId }) => optionId === 2)?.firstPct || 0;

  return (
    <Box>
      <YesNoAbstainBar
        yesPercent={formatValue(parseEther(yesPercent.toString()), undefined, 0)}
        noPercent={formatValue(parseEther(noPercent.toString()), undefined, 0)}
        abstainPercent={formatValue(parseEther(abstainPercent.toString()), undefined, 0)}
        showTitles={showTitles}
      />
    </Box>
  );
}
