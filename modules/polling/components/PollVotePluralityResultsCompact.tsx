import { parseUnits } from 'ethers/lib/utils';
import { formatValue } from 'lib/string';
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
        yesPercent={formatValue(parseUnits(yesPercent.toString()), undefined, 0)}
        noPercent={formatValue(parseUnits(noPercent.toString()), undefined, 0)}
        abstainPercent={formatValue(parseUnits(abstainPercent.toString()), undefined, 0)}
        showTitles={showTitles}
      />
    </Box>
  );
}
