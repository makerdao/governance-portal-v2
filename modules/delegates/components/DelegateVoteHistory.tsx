import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { Box, Divider, Text } from 'theme-ui';
import useSWR, { useSWRConfig } from 'swr';
import { fetchJson } from 'lib/fetchJson';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { Delegate } from 'modules/delegates/types';

export function DelegateVoteHistory({ delegate }: { delegate: Delegate }): React.ReactElement {
  const { network } = useActiveWeb3React();

  const { cache } = useSWRConfig();

  const dataKeyDelegateStats = `/api/address/${
    delegate.voteDelegateAddress
  }/stats?delegate=true&network=${network}${
    delegate.previous ? `&prev=${delegate.previous.voteDelegateAddress}` : ''
  }`;
  const { data: statsData } = useSWR<AddressAPIStats>(delegate ? dataKeyDelegateStats : null, fetchJson, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKeyDelegateStats),
    revalidateOnReconnect: false
  });

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
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
          <Divider mt={3} mb={3} />
        </Box>

        {statsData && (
          <ErrorBoundary componentName="Poll Vote History">
            <PollVoteHistoryList votes={statsData.pollVoteHistory} />
          </ErrorBoundary>
        )}

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
