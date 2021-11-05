import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { Box, Divider, Text } from 'theme-ui';
import { Delegate } from '../types';
import { DelegateMKRChart } from './DelegateMKRChart';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';

export function DelegateVoteHistory({ stats, delegate }: { stats: AddressAPIStats, delegate: Delegate}): React.ReactElement {
  return (
    <Box>
      <Box>
        <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4] }}>
          <Text
            as="p"
            sx={{
              fontSize: 4,
              fontWeight: 'semiBold'
            }}
          >
            Polling Proposals
          </Text>
          <Divider mt={3} />
        </Box>

        <PollVoteHistoryList votes={stats.pollVoteHistory} />

        <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4] }}>
          <DelegateMKRChart delegate={delegate} />
        </Box>
      </Box>

      


      <PollingParticipationOverview votes={stats.pollVoteHistory} />
    </Box>
  );
}
