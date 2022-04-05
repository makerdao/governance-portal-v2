import React, { useState } from 'react';
import { Box, Text, Link as ExternalLink, Flex, Divider } from 'theme-ui';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import Tabs from 'modules/app/components/Tabs';
import {
  DelegatePicture,
  DelegateContractExpiration,
  DelegateCredentials,
  DelegateVoteHistory,
  DelegateParticipationMetrics
} from 'modules/delegates/components';
import { Delegate } from 'modules/delegates/types';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { DelegateMKRDelegatedStats } from './DelegateMKRDelegatedStats';
import { DelegateMKRChart } from './DelegateMKRChart';
import useSWR, { useSWRConfig } from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import LastVoted from 'modules/polling/components/LastVoted';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import DelegatedByAddress from 'modules/delegates/components/DelegatedByAddress';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AccountComments from 'modules/comments/components/AccountComments';
import { Address } from 'modules/address/components/Address';
import { formatDelegationHistory } from '../helpers/formatDelegationHistory';
import { CoreUnitModal } from './modals/CoreUnitModal';
import { CoreUnitButton } from './modals/CoreUnitButton';

type PropTypes = {
  delegate: Delegate;
};


export function DelegateDetail({ delegate }: PropTypes): React.ReactElement {
  const { voteDelegateAddress } = delegate;
  const { network } = useActiveWeb3React();
  const { cache } = useSWRConfig();
  const [showCoreUnitModal, setShowCoreUnitModal] = useState(false);

  const handleInfoClick = () => {
    setShowCoreUnitModal(!showCoreUnitModal);
  };

  const dataKeyDelegateStats = `/api/address/${delegate.voteDelegateAddress}/stats?network=${network}`;
  const { data: statsData } = useSWR<AddressAPIStats>(delegate ? dataKeyDelegateStats : null, fetchJson, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKeyDelegateStats),
    revalidateOnReconnect: false
  });

  const { data: totalStaked } = useLockedMkr(delegate.voteDelegateAddress);
  const { voteDelegateContractAddress } = useAccount();
  const delegationHistory = formatDelegationHistory(delegate.mkrLockedDelegate);

  const activeDelegators = delegationHistory.filter(({ lockAmount }) => parseInt(lockAmount) > 0);
  const delegatorCount = activeDelegators.length;
  const isOwner = delegate.voteDelegateAddress.toLowerCase() === voteDelegateContractAddress?.toLowerCase();

  const tabTitles = [
    delegate.status === DelegateStatusEnum.recognized ? 'Delegate Credentials' : null,
    'Metrics',
    'Voting History',
    'Comments'
  ].filter(i => !!i) as string[];

  const tabPanels = [
    delegate.status === DelegateStatusEnum.recognized ? (
      <Box key="delegate-credentials">
        <DelegateCredentials delegate={delegate} />
      </Box>
    ) : null,
    <Box key="delegate-participation-metrics">
      {delegate.status === DelegateStatusEnum.recognized && (
        <DelegateParticipationMetrics delegate={delegate} />
      )}
      {delegate.status === DelegateStatusEnum.recognized && <Divider />}
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
      <DelegateVoteHistory delegate={delegate} />
    </Box>,
    <Box key="account-comments" sx={{ p: [3, 4] }}>
      <AccountComments address={delegate.voteDelegateAddress} />
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
            <Flex>
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
                  <ExternalLink
                    title="View on etherescan"
                    href={getEtherscanLink(network, voteDelegateAddress, 'address')}
                    target="_blank"
                  >
                    <Text as="p" sx={{ fontSize: [1, 3], mt: [1, 0], fontWeight: 'semiBold' }}>
                      Delegate contract <Icon ml={2} name="arrowTopRight" size={2} />
                    </Text>
                  </ExternalLink>
                  <Link href={`/address/${delegate.address}`} passHref>
                    <ExternalLink>
                      <Text as="p" variant="secondary" sx={{ fontSize: [1, 2], mt: [1, 0] }}>
                        Deployed by: <Address address={delegate.address} />
                      </Text>
                    </ExternalLink>
                  </Link>
                </Box>
              </Box>
            </Flex>
          </Box>
          <Flex sx={{ mt: [3, 0], flexDirection: 'column', alignItems: ['flex-start', 'flex-end'] }}>
            {delegate.cuMember && <CoreUnitButton handleInfoClick={handleInfoClick} />}
            <LastVoted
              expired={delegate.expired}
              date={statsData?.lastVote?.blockTimestamp || ''}
              styles={{ my: 1 }}
            />
            <DelegateContractExpiration delegate={delegate} />
          </Flex>
        </Flex>
        <Box sx={{ mt: [3], display: 'flex', flexDirection: 'column' }}>
          <DelegateMKRDelegatedStats delegate={delegate} delegatorCount={delegatorCount} />
        </Box>
      </Box>

      <Tabs tabListStyles={{ pl: [3, 4] }} tabTitles={tabTitles} tabPanels={tabPanels}></Tabs>
      {showCoreUnitModal && (
        <CoreUnitModal isOpen={showCoreUnitModal} onDismiss={() => setShowCoreUnitModal(false)} />
      )}
    </Box>
  );
}
