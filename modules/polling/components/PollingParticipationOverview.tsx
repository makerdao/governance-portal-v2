/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Text } from 'theme-ui';
import BigNumber from 'lib/bigNumberJs';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { YesNoAbstainBar } from './YesNoAbstainBar';
import { hasVictoryConditionPlurality } from '../helpers/utils';

export function PollingParticipationOverview({
  votes
}: {
  votes: PollVoteHistory[];
}): React.ReactElement | null {
  const filteredVotes = votes.filter(i => hasVictoryConditionPlurality(i.poll.parameters.victoryConditions));
  const total = filteredVotes.length;
  const showHistory = total > 0;

  const votedYes = new BigNumber(filteredVotes.filter(vote => vote.ballot.indexOf(1) !== -1).length);
  const votedNo = new BigNumber(filteredVotes.filter(vote => vote.ballot.indexOf(2) !== -1).length);
  const votedAbstain = new BigNumber(filteredVotes.filter(vote => vote.ballot.indexOf(0) !== -1).length);

  const yesPercent = votedYes.isGreaterThan(0) ? votedYes.dividedBy(total).multipliedBy(100).toFixed(0) : 0;
  const abstainPercent = votedAbstain.isGreaterThan(0)
    ? votedAbstain.dividedBy(total).multipliedBy(100).toFixed(0)
    : 0;
  const noPercent = votedNo.isGreaterThan(0) ? votedNo.dividedBy(total).multipliedBy(100).toFixed(0) : 0;

  return showHistory ? (
    <Box sx={{ p: [3, 4] }}>
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
          Percentage of times this delegate has voted yes, no, or abstain over time
        </Text>
      </Box>
      <YesNoAbstainBar yesPercent={yesPercent} noPercent={noPercent} abstainPercent={abstainPercent} />
    </Box>
  ) : null;
}
