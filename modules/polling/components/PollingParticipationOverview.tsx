/** @jsx jsx */

import { Box, Text, jsx } from 'theme-ui';
import BigNumber from 'bignumber.js';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { POLL_VOTE_TYPE } from '../polling.constants';
import { YesNoAbstainBar } from './YesNoAbstainBar';

export function PollingParticipationOverview({ votes }: { votes: PollVoteHistory[] }): React.ReactElement {
 
  const filteredVotes = votes.filter(i => i.poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE);
  const total = filteredVotes.length;

  const votedYes = new BigNumber(filteredVotes.filter(vote => vote.option === 1).length);
  const votedNo = new BigNumber(filteredVotes.filter(vote => vote.option === 2).length);
  const votedAbstain = new BigNumber(filteredVotes.filter(vote => vote.option === 0).length);

  const yesPercent = votedYes.isGreaterThan(0) ? votedYes.dividedBy(total).multipliedBy(100).toFixed(0): 0;
  const abstainPercent = votedAbstain.isGreaterThan(0) ? votedAbstain.dividedBy(total).multipliedBy(100).toFixed(0): 0;
  const noPercent = votedNo.isGreaterThan(0) ? votedNo.dividedBy(total).multipliedBy(100).toFixed(0): 0;


  return (
    <Box>
      <Box mb={3}>
        <Text
          as="p"
          variant="h2"
          sx={{
            fontSize: 4,
            fontWeight: 'semiBold'
          }}
        >
          Polling Participation Overview
        </Text>
        <Text as="p" variant="secondary" color="onSurface">
          Percentage of times that voted yes, no or abstain over time
        </Text>
      </Box>
      <YesNoAbstainBar yesPercent={yesPercent} noPercent={noPercent} abstainPercent={abstainPercent} />
    </Box>
  );
}
