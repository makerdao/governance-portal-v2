import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { Box, Divider, Flex, Heading, Text } from 'theme-ui';
import { Delegate } from '../types';
import useSWR from 'swr';
import { getNetwork } from 'lib/maker';
import { fetchJson } from 'lib/fetchJson';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import DelegatedByAddress from 'modules/delegates/components/DelegatedByAddress';
import { DelegationHistory } from 'modules/delegates/types';

export function DelegateVoteHistory({ delegate }: { delegate: Delegate }): React.ReactElement {
  const { data: statsData } = useSWR<AddressAPIStats>(
    `/api/address/${delegate.voteDelegateAddress}/stats?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnMount: true
    }
  );

  const { data: delegators } = useSWR<DelegationHistory[]>(
    `/api/delegates/delegation-history/${delegate.voteDelegateAddress}?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnMount: true
    }
  );
  const { data: totalStaked } = useLockedMkr(delegate.voteDelegateAddress);

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4] }}>
          {delegators && (
            <Flex sx={{ flexDirection: 'column' }}>
              <Heading variant="microHeading" sx={{ mb: 3 }}>
                MKR Delegated Per Address
              </Heading>
              <DelegatedByAddress delegators={delegators} totalDelegated={totalStaked} />
              <Divider mt={3} mb={3} />
            </Flex>
          )}
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
