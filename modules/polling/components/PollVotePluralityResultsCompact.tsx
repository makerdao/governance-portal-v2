/** @jsx jsx */
import BigNumber from 'bignumber.js';
import { Box,  jsx } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { YesNoAbstainBar } from './YesNoAbstainBar';

export function PollVotePluralityResultsCompact({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const max = new BigNumber(vote.tally.totalMkrParticipation);

  const abstainValue = new BigNumber(vote.tally.options['0'] ? vote.tally.options['0'].firstChoice : 0);
  const yesValue = new BigNumber(vote.tally.options['1'] ? vote.tally.options['1'].firstChoice : 0);
  const noValue = new BigNumber(vote.tally.options['2'] ? vote.tally.options['2'].firstChoice : 0);

  const yesPercent = yesValue.dividedBy(max).multipliedBy(100).toFixed(0);
  const abstainPercent = abstainValue.dividedBy(max).multipliedBy(100).toFixed(0);
  const noPercent = noValue.dividedBy(max).multipliedBy(100).toFixed(0);


  return (
    <Box>
      <YesNoAbstainBar yesPercent={yesPercent} noPercent={noPercent} abstainPercent={abstainPercent} />
    </Box>
  );
}
