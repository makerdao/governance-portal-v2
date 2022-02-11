import React from 'react';
import { Box, Text, Flex, Divider } from 'theme-ui';
import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressAPIStats } from '../types/addressApiResponse';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import LastVoted from 'modules/polling/components/LastVoted';
import AddressDelegatedTo from './AddressDelegatedTo';
import { MKRDelegatedToAPIResponse } from 'pages/api/address/[address]/delegated-to';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { AddressMKRDelegatedStats } from './AddressMKRDelegatedStats';
import AddressIconBox from './AddressIconBox';
import { VoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';

type PropTypes = {
  address: string;
  voteProxyInfo?: VoteProxyAddresses;
};

export function AddressDetail({ address, voteProxyInfo }: PropTypes): React.ReactElement {
  const { network } = useActiveWeb3React();
  const { data: statsData } = useSWR<AddressAPIStats>(
    `/api/address/${address}/stats?network=${network}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  const { data: delegatedToData } = useSWR<MKRDelegatedToAPIResponse>(
    `/api/address/${address}/delegated-to?network=${network}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  return (
    <Box sx={{ variant: 'cards.primary', p: [0, 0] }}>
      <Flex
        sx={{
          justifyContent: 'space-between',
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          p: [3, 4]
        }}
      >
        <AddressIconBox address={address} showExternalLink />

        <Box sx={{ pt: [2, 0] }}>
          <LastVoted expired={false} date={statsData?.lastVote?.blockTimestamp || ''} />
        </Box>
      </Flex>

      <Box sx={{ pl: [3, 4], pr: [3, 4], display: 'flex', flexDirection: 'column' }}>
        <AddressMKRDelegatedStats totalMKRDelegated={delegatedToData?.totalDelegated} address={address} />
      </Box>
      <Divider mt={1} mb={1} />

      <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4] }}>
        <Text
          as="p"
          sx={{
            fontSize: 4,
            mb: 3,
            fontWeight: 'semiBold'
          }}
        >
          MKR Delegated by Address
        </Text>
        {!delegatedToData && (
          <Box mb={3}>
            <SkeletonThemed width={'300px'} height={'30px'} />
          </Box>
        )}
        {delegatedToData && delegatedToData.delegatedTo.length > 0 && (
          <AddressDelegatedTo
            delegatedTo={delegatedToData?.delegatedTo}
            totalDelegated={delegatedToData?.totalDelegated}
          />
        )}
        {delegatedToData && delegatedToData.delegatedTo.length === 0 && (
          <Box mb={3}>
            <Text>No MKR delegated</Text>
          </Box>
        )}
      </Box>

      <Divider mt={1} mb={1} />

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

        {!statsData && (
          <Box mb={3}>
            <SkeletonThemed width={'300px'} height={'30px'} />
          </Box>
        )}
      </Box>

      {statsData && (
        <ErrorBoundary componentName={'Poll Vote History'}>
          <PollVoteHistoryList votes={statsData.pollVoteHistory} />
        </ErrorBoundary>
      )}

      {statsData && (
        <ErrorBoundary componentName={'Poll Participation Overview'}>
          <PollingParticipationOverview votes={statsData.pollVoteHistory} />
        </ErrorBoundary>
      )}
    </Box>
  );
}
