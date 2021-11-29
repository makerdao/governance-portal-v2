import BigNumber from 'bignumber.js';
import { Box } from 'theme-ui';
import { PollTally, PollTallyPluralityOption } from '../types';
import { YesNoAbstainBar } from './YesNoAbstainBar';

export function PollVotePluralityResultsCompact({
  tally,
  showTitles = true
}: {
  tally: PollTally;
  showTitles?: boolean;
}): React.ReactElement {
  const max = new BigNumber(tally.totalMkrParticipation);

  const voteTallyOptions = tally.options as PollTallyPluralityOption;

  const abstainValue = new BigNumber(voteTallyOptions['0'] ? voteTallyOptions['0'].mkrSupport : 0);
  const yesValue = new BigNumber(voteTallyOptions['1'] ? voteTallyOptions['1'].mkrSupport : 0);
  const noValue = new BigNumber(voteTallyOptions['2'] ? voteTallyOptions['2'].mkrSupport : 0);

  const yesPercent = yesValue.isGreaterThan(0) ? yesValue.dividedBy(max).multipliedBy(100).toFixed(0) : 0;
  const abstainPercent = abstainValue.isGreaterThan(0) ? abstainValue.dividedBy(max).multipliedBy(100).toFixed(0): 0;
  const noPercent =noValue.isGreaterThan(0) ?  noValue.dividedBy(max).multipliedBy(100).toFixed(0) : 0;

  return (
    <Box>
      <YesNoAbstainBar
        yesPercent={yesPercent}
        noPercent={noPercent}
        abstainPercent={abstainPercent}
        showTitles={showTitles}
      />
    </Box>
  );
}
