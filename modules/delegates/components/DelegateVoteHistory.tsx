import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { Box, Divider, Text } from 'theme-ui';
import { Delegate } from '../types';
import useSWR from 'swr';
import { getNetwork } from 'lib/maker';
import { fetchJson } from 'lib/fetchJson';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import DelegatedByAddress from 'modules/delegates/components/DelegatedByAddress';

export function DelegateVoteHistory({
  delegate,
  delegatedFrom,
  totalStaked
}: {
  delegate: Delegate;
}): React.ReactElement {
  const { data: statsData } = useSWR<AddressAPIStats>(
    `/api/address/${delegate.voteDelegateAddress}/stats?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnMount: true
    }
  );

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4] }}>
          <DelegatedByAddress delegators={delegatedFrom} totalDelegated={totalStaked} />
          <Divider mt={1} mb={1} />
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
        </Box>

        {statsData && <PollVoteHistoryList votes={statsData.pollVoteHistory} />}
        {!statsData &&
          [1, 2, 3, 4, 5].map(i => (
            <Box sx={{ p: 4 }} key={`loading-${i}`}>
              <SkeletonThemed width={'100%'} height={'30px'} />
            </Box>
          ))}
      </Box>
    </Box>
  );
}
