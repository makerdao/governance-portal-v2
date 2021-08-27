import { PollVoteHistoryList } from 'modules/polls/components/PollVoteHistoryList';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { Box, Divider, Text } from 'theme-ui';
import { Delegate } from '../types';

export function DelegateVoteHistory({ delegate, stats }: { delegate: Delegate, stats: AddressAPIStats}): React.ReactElement {
  return (
    <Box p={[3,4]}>
      <Text as="p" sx={{
        fontSize: '18px',
        fontWeight: 500
      }}>Polling Proposals</Text>

      <Divider mt={3} mb={3} />
      <PollVoteHistoryList votes={stats.pollVoteHistory} />

      
    </Box>
  );
}