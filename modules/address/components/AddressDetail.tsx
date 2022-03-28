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
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import AccountComments from 'modules/comments/components/AccountComments';
import Tabs from 'modules/app/components/Tabs';

type PropTypes = {
  address: string;
};

export function AddressDetail({ address }: PropTypes): React.ReactElement {
  const { network } = useActiveWeb3React();
  const { data: statsData } = useSWR<AddressAPIStats>(
    address ? `/api/address/${address}/stats?network=${network}` : null,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  const { data: delegatedToData } = useSWR<MKRDelegatedToAPIResponse>(
    address ? `/api/address/${address}/delegated-to?network=${network}` : null,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  const tabTitles = ['Account Details', 'Comments'];

  const tabPanels = [
    <Box key="account-detail">
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
    </Box>,
    <Box key="account-comments" sx={{ p: [3, 4] }}>
      <AccountComments address={address} />
    </Box>
  ];

  return (
    <Box sx={{ variant: 'cards.primary', p: [0, 0] }}>
      <Flex
        sx={{
          justifyContent: 'space-between',
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          pt: [3, 4],
          pl: [3, 4],
          pr: [3, 4],
          pb: 1
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

      <Tabs tabListStyles={{ pl: [3, 4] }} tabTitles={tabTitles} tabPanels={tabPanels}></Tabs>
    </Box>
  );
}
