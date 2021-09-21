import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { Box, Divider, Text } from 'theme-ui';
import { Delegate } from '../types';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';

export function DelegateVoteHistory({
  delegate,
  stats
}: {
  delegate: Delegate;
  stats: AddressAPIStats;
}): React.ReactElement {
  return (
    <Box>
      <Box p={[3, 4]}>
        <Text
          as="p"
          sx={{
            fontSize: 4,
            fontWeight: 'semiBold'
          }}
        >
          Polling Proposals
        </Text>

        <Divider mt={3} mb={3} />
        <PollVoteHistoryList votes={stats.pollVoteHistory} />
      </Box>
      <Divider mt={3} mb={1} />

      <Box p={[3, 4]}>
        <PollingParticipationOverview votes={stats.pollVoteHistory} />
      </Box>
    </Box>
  );
}
