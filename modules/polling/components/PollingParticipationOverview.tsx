/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Text } from 'theme-ui';
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

  const votedYes = filteredVotes.filter(vote => vote.ballot.indexOf(1) !== -1).length;
  const votedNo = filteredVotes.filter(vote => vote.ballot.indexOf(2) !== -1).length;
  const votedAbstain = filteredVotes.filter(vote => vote.ballot.indexOf(0) !== -1).length;

  const yesPercent = votedYes > 0 ? ((votedYes / total) * 100).toFixed(0) : 0;
  const abstainPercent = votedAbstain > 0 ? ((votedAbstain / total) * 100).toFixed(0) : 0;
  const noPercent = votedNo > 0 ? ((votedNo / total) * 100).toFixed(0) : 0;

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
