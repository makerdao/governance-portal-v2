import BigNumber from 'bignumber.js';
import { Box } from 'theme-ui';
import { PollTally, PluralityResult } from '../types';
import { YesNoAbstainBar } from './YesNoAbstainBar';

export function PollVotePluralityResultsCompact({
  tally,
  showTitles = true
}: {
  tally: PollTally;
  showTitles?: boolean;
}): React.ReactElement {
  const voteTallyResults = tally.results as PluralityResult[];

  const yesPercent = voteTallyResults.find(({ optionId }) => optionId === '1')?.firstPct || 0;
  const abstainPercent = voteTallyResults.find(({ optionId }) => optionId === '0')?.firstPct || 0;
  const noPercent = voteTallyResults.find(({ optionId }) => optionId === '2')?.firstPct || 0;

  return (
    <Box>
      <YesNoAbstainBar
        yesPercent={new BigNumber(yesPercent).toFixed(0)}
        noPercent={new BigNumber(noPercent).toFixed(0)}
        abstainPercent={new BigNumber(abstainPercent).toFixed(0)}
        showTitles={showTitles}
      />
    </Box>
  );
}
