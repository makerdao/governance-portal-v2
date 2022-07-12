import React from 'react';
import { Box, Text, Flex, Divider } from 'theme-ui';
import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressApiResponse, AddressAPIStats } from '../types/addressApiResponse';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import LastVoted from 'modules/polling/components/LastVoted';
import AddressDelegatedTo from './AddressDelegatedTo';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { AddressMKRDelegatedStats } from './AddressMKRDelegatedStats';
import AddressIconBox from './AddressIconBox';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import AccountComments from 'modules/comments/components/AccountComments';
import Tabs from 'modules/app/components/Tabs';
import { useDelegatedTo } from 'modules/delegates/hooks/useDelegatedTo';
import { InternalLink } from 'modules/app/components/InternalLink';

export function AddressDetail({ addressInfo }: { addressInfo: AddressApiResponse }): React.ReactElement {
  const { network } = useActiveWeb3React();
  const { data: statsData } = useSWR<AddressAPIStats>(
    addressInfo
      ? `/api/address/stats?address=${
          addressInfo.voteProxyInfo?.hotAddress ? addressInfo.voteProxyInfo.hotAddress : addressInfo.address
        }&network=${network}`
      : null,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  const { data: delegatedToData } = useDelegatedTo(addressInfo.address, network);

  const tabTitles = ['Account Details', 'Comments'];

  const tabPanels = [
    <Box key="account-detail">
      {addressInfo.voteDelegateAdress && (
        <Box>
          <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4] }}>
            <Text
              as="p"
              sx={{
                fontSize: 4,
                mb: 3,
                fontWeight: 'semiBold'
              }}
            >
              Vote Delegate Contract
            </Text>
            <Text as="p">
              <InternalLink href={`/address/${addressInfo.voteDelegateAdress}`} title="View address detail">
                <AddressIconBox
                  address={addressInfo.voteDelegateAdress.toLowerCase()}
                  width={41}
                  limitTextLength={0}
                />
              </InternalLink>
            </Text>
          </Box>
        </Box>
      )}

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
      <AccountComments address={addressInfo.address} />
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
        <AddressIconBox address={addressInfo.address} showExternalLink />

        <Box sx={{ pt: [2, 0] }}>
          <LastVoted
            expired={false}
            date={statsData ? (statsData.lastVote ? statsData.lastVote.blockTimestamp : null) : undefined}
          />
        </Box>
      </Flex>

      <Box sx={{ pl: [3, 4], pr: [3, 4], display: 'flex', flexDirection: 'column' }}>
        <AddressMKRDelegatedStats
          totalMKRDelegated={delegatedToData?.totalDelegated}
          address={addressInfo.address}
        />
      </Box>

      <Tabs tabListStyles={{ pl: [3, 4] }} tabTitles={tabTitles} tabPanels={tabPanels}></Tabs>
    </Box>
  );
}
