/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Card, Divider, Flex } from 'theme-ui';
import BallotPollBar from '../BallotPollBar';
import VotingWeight from '../VotingWeight';

const ReviewBoxCard = ({ children }) => (
  <Card variant="compact" p={0}>
    <Flex sx={{ justifyContent: ['center'], flexDirection: 'column' }}>{children}</Flex>
  </Card>
);

export default function ActivePollsBox({
  activePollCount,
  activePollIds,
  children,
  voted
}: {
  activePollCount: number;
  activePollIds: number[];
  voted?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <ReviewBoxCard>
      <BallotPollBar activePollCount={activePollCount} activePollIds={activePollIds} voted={voted} />
      <Divider />
      <Box sx={{ px: 3, py: 2, mb: 1 }}>
        <VotingWeight />
      </Box>
      <Divider m={0} sx={{ display: ['none', 'block'] }} />

      {children}
    </ReviewBoxCard>
  );
}
