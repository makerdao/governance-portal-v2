/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React from 'react';
import { Box, Text, Flex, Divider } from 'theme-ui';
import Tabs from 'modules/app/components/Tabs';
import {
  DelegatePicture,
  DelegateCredentials,
  DelegateVoteHistory,
  DelegateParticipationMetrics
} from 'modules/delegates/components';
import { Delegate } from 'modules/delegates/types';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { DelegateMKRDelegatedStats } from './DelegateSKYDelegatedStats';
import { DelegateMKRChart } from './DelegateSKYChart;
import useSWR, { useSWRConfig } from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import LastVoted from 'modules/polling/components/LastVoted';
import { useLockedSky } from 'modules/sky/hooks/useLockedSky';
import DelegatedByAddress from 'modules/delegates/components/DelegatedByAddress';
import { useAccount } from 'modules/app/hooks/useAccount';
import { Address } from 'modules/address/components/Address';
import { formatDelegationHistory } from '../helpers/formatDelegationHistory';
import { InternalLink } from 'modules/app/components/InternalLink';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import { parseEther } from 'viem';

type PropTypes = {
  delegate: Delegate;
};

export function DelegateDetail({ delegate }: PropTypes): React.ReactElement {
  const { voteDelegateAddress } = delegate;
  const network = useNetwork();
  const { cache } = useSWRConfig();

  const dataKeyDelegateStats = `/api/address/stats?address=${delegate.voteDelegateAddress}&network=${network}`;
  const { data: statsData } = useSWR<AddressAPIStats>(delegate ? dataKeyDelegateStats : null, fetchJson, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKeyDelegateStats),
    revalidateOnReconnect: false
  });

  const { data: totalStaked } = useLockedSky(delegate.voteDelegateAddress);
  const { voteDelegateContractAddress } = useAccount();
  const delegationHistory = formatDelegationHistory(delegate.skyLockedDelegate);

  const activeDelegators = delegationHistory.filter(({ lockAmount }) => parseEther(lockAmount) > 0n);
  const delegatorCount = activeDelegators.length;
  const isOwner = delegate.voteDelegateAddress.toLowerCase() === voteDelegateContractAddress?.toLowerCase();

  const tabTitles = [
    delegate.status === DelegateStatusEnum.aligned ? 'Delegate Credentials' : null,
    'Metrics',
    'Voting History'
  ].filter(i => !!i) as string[];

  const tabPanels = [
    delegate.status === DelegateStatusEnum.aligned ? (
      <Box key="delegate-credentials">
        <DelegateCredentials delegate={delegate} />
      </Box>
    ) : null,
    <Box key="delegate-participation-metrics">
      {delegate.status === DelegateStatusEnum.aligned && <DelegateParticipationMetrics delegate={delegate} />}
      {delegate.status === DelegateStatusEnum.aligned && <Divider />}
      {delegationHistory.length > 0 && totalStaked ? (
        <>
          <Box sx={{ pl: [3, 4], pr: [3, 4], py: [3, 4] }}>
            <DelegatedByAddress delegators={delegationHistory} totalDelegated={totalStaked} />
          </Box>
          <Divider />

          <Box sx={{ pl: [3, 4], pr: [3, 4], pb: [3, 4] }}>
            <DelegateMKRChart delegate={delegate} />
          </Box>
          <Divider />
        </>
      ) : (
        <Box p={[3, 4]} mt={1}>
          <Text>No metrics data found</Text>
        </Box>
      )}
      {statsData && <PollingParticipationOverview votes={statsData.pollVoteHistory} />}
    </Box>,
    <Box key="delegate-vote-history">
      <DelegateVoteHistory delegate={delegate} dataKeyDelegateStats={dataKeyDelegateStats} />
    </Box>
  ].filter(i => !!i);

  return (
    <Box sx={{ variant: 'cards.primary', p: [0, 0] }}>
      <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4], pb: 2 }}>
        <Flex
          sx={{
            justifyContent: 'space-between',
            flexDirection: ['column', 'row']
          }}
        >
          <Box>
            <Flex sx={{ mb: 1 }}>
              <DelegatePicture delegate={delegate} key={delegate.id} width={52} />
              <Box sx={{ width: '100%' }}>
                <Box sx={{ ml: 3 }}>
                  <Flex sx={{ alignItems: 'center' }}>
                    <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                      {delegate.name !== '' ? delegate.name : 'Shadow Delegate'}
                    </Text>
                    {isOwner && (
                      <Flex
                        sx={{
                          display: 'inline-flex',
                          backgroundColor: 'tagColorSevenBg',
                          borderRadius: 'roundish',
                          padding: '3px 6px',
                          alignItems: 'center',
                          color: 'tagColorSeven',
                          ml: 2
                        }}
                      >
                        <Text sx={{ fontSize: 1 }}>Owner</Text>
                      </Flex>
                    )}
                  </Flex>

                  <Box sx={{ fontSize: [1, 3], mt: [1, 0], fontWeight: 'semiBold' }}>
                    <EtherscanLink
                      showBlockExplorerName={false}
                      type="address"
                      prefix="Delegate contract"
                      hash={voteDelegateAddress}
                      network={network}
                    />
                  </Box>

                  <InternalLink href={`/address/${delegate.address}`} title="View address">
                    <Text as="p" variant="secondary" sx={{ fontSize: [1, 2], mt: [1, 0] }}>
                      Deployed by: <Address address={delegate.address} />
                    </Text>
                  </InternalLink>
                </Box>
              </Box>
            </Flex>
          </Box>
          <Flex sx={{ mt: [2, 0], flexDirection: 'column', alignItems: ['flex-start', 'flex-end'] }}>
            <LastVoted
              date={statsData ? (statsData.lastVote ? statsData.lastVote.blockTimestamp : null) : undefined}
              styles={{ my: 1 }}
            />
          </Flex>
        </Flex>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <DelegateMKRDelegatedStats delegate={delegate} delegatorCount={delegatorCount} />
        </Box>
      </Box>

      <Tabs tabListStyles={{ pl: [3, 4] }} tabTitles={tabTitles} tabPanels={tabPanels}></Tabs>
    </Box>
  );
}
