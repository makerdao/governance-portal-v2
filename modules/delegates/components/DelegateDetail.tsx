import React from 'react';
import { Box, Text, Link as ExternalLink, Flex, Divider } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
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
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import LastVoted from 'modules/polling/components/LastVoted';

type PropTypes = {
  delegate: Delegate;
};

export function DelegateDetail({ delegate }: PropTypes): React.ReactElement {
  const { voteDelegateAddress } = delegate;
  const { data: statsData } = useSWR<AddressAPIStats>(
    `/api/address/${delegate.voteDelegateAddress}/stats?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  const tabTitles = [
    delegate.status === DelegateStatusEnum.recognized ? 'Delegate Credentials' : null,
    'Metrics',
    'Voting History'
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
      <Box sx={{ pl: [3, 4], pr: [3, 4], pb: [3, 4] }}>
        <DelegateMKRChart delegate={delegate} />
      </Box>
      <Divider />
      {statsData && <PollingParticipationOverview votes={statsData.pollVoteHistory} />}
    </Box>,
    <Box key="delegate-vote-history">
      <DelegateVoteHistory delegate={delegate} />
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
              <DelegatePicture delegate={delegate} key={delegate.id} width={'52px'} />
              <Box sx={{ width: '100%' }}>
                <Box sx={{ ml: 3 }}>
                  <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                    {delegate.name !== '' ? delegate.name : 'Shadow Delegate'}
                  </Text>
                  <ExternalLink
                    title="View on etherescan"
                    href={getEtherscanLink(getNetwork(), voteDelegateAddress, 'address')}
                    target="_blank"
                  >
                    <Text as="p" sx={{ fontSize: [1, 3], mt: [1, 0], fontWeight: 'semiBold' }}>
                      Delegate contract <Icon ml={2} name="arrowTopRight" size={2} />
                    </Text>
                  </ExternalLink>
                </Box>
              </Box>
            </Flex>
          </Box>
          <Flex sx={{ mt: [3, 0], flexDirection: 'column', alignItems: ['flex-start', 'flex-end'] }}>
            <LastVoted expired={delegate.expired} date={statsData?.lastVote?.blockTimestamp || ''} />
            <DelegateContractExpiration delegate={delegate} />
          </Flex>
        </Flex>
        <Box sx={{ mt: [2], display: 'flex', flexDirection: 'column' }}>
          <DelegateMKRDelegatedStats delegate={delegate} />
        </Box>
      </Box>

      <Tabs tabListStyles={{ pl: [3, 4] }} tabTitles={tabTitles} tabPanels={tabPanels}></Tabs>
    </Box>
  );
}
