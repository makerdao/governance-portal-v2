import BigNumber from 'bignumber.js';
import { Box } from 'theme-ui';
import { PollTallyPluralityOption } from '../types';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { YesNoAbstainBar } from './YesNoAbstainBar';

export function PollVotePluralityResultsCompact({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const max = new BigNumber(vote.tally.totalMkrParticipation);

  const voteTallyOptions = vote.tally.options as PollTallyPluralityOption;

  const abstainValue = new BigNumber(voteTallyOptions['0'] ? voteTallyOptions['0'].mkrSupport : 0);
  const yesValue = new BigNumber(voteTallyOptions['1'] ? voteTallyOptions['1'].mkrSupport : 0);
  const noValue = new BigNumber(voteTallyOptions['2'] ? voteTallyOptions['2'].mkrSupport : 0);

  const yesPercent = yesValue.dividedBy(max).multipliedBy(100).toFixed(0);
  const abstainPercent = abstainValue.dividedBy(max).multipliedBy(100).toFixed(0);
  const noPercent = noValue.dividedBy(max).multipliedBy(100).toFixed(0);

  return (
    <Box>
      <YesNoAbstainBar yesPercent={yesPercent} noPercent={noPercent} abstainPercent={abstainPercent} />
    </Box>
  );
}
