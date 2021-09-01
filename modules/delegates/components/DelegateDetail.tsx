/** @jsx jsx */
import React from 'react';
import { jsx, Box, Text, Link as ExternalLink, Flex } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import { Delegate } from '../types';
import { DelegatePicture } from './DelegatePicture';
import { DelegateContractExpiration } from './DelegateContractExpiration';
import { DelegateCredentials } from './DelegateCredentials';
import { Icon } from '@makerdao/dai-ui-icons';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import Tabs from 'components/Tabs';
import { DelegateVoteHistory } from './DelegateVoteHistory';
import { DelegateParticipationMetrics } from './DelegateParticipationMetrics';
import { DelegateStatusEnum } from '../delegates.constants';

type PropTypes = {
  delegate: Delegate;
  stats: AddressAPIStats;
};

export function DelegateDetail({ delegate, stats }: PropTypes): React.ReactElement {
  const bpi = useBreakpointIndex();

  const { voteDelegateAddress } = delegate;

  const tabTitles = [
    delegate.status === DelegateStatusEnum.recognized ? 'Delegate Credentials' : null,
    'Participation Metrics',
    'Voting History'
  ].filter(i => !!i) as string[];

  const tabPanels = [
    delegate.status === DelegateStatusEnum.recognized ? (
      <Box key="delegate-credentials">
        <DelegateCredentials delegate={delegate} />
      </Box>
    ) : null,
    <Box key="delegate-participation-metrics">
      <DelegateParticipationMetrics delegate={delegate} />
    </Box>,
    <Box key="delegate-vote-history">
      <DelegateVoteHistory delegate={delegate} stats={stats} />
    </Box>
  ].filter(i => !!i);

  return (
    <Box sx={{ variant: 'cards.primary', p: [0, 0] }}>
      <Box sx={{ p: [3, 4], pb: 3 }}>
        <Flex
          sx={{
            justifyContent: 'space-between',
            flexDirection: ['column', 'row']
          }}
        >
          <Box>
            <Flex>
              <DelegatePicture delegate={delegate} key={delegate.id} />
              <Box sx={{ width: '100%' }}>
                <Box sx={{ ml: 2 }}>
                  <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                    {delegate.name}
                  </Text>
                  <ExternalLink
                    title="View on etherescan"
                    href={getEtherscanLink(getNetwork(), voteDelegateAddress, 'address')}
                    target="_blank"
                  >
                    <Text as="p" sx={{ fontSize: bpi > 0 ? 3 : 1 }}>
                      Delegate contract <Icon ml={2} name="arrowTopRight" size={2} />
                    </Text>
                  </ExternalLink>
                  <Box></Box>
                </Box>
              </Box>
            </Flex>
            {delegate.externalUrl && (
              <Box sx={{ mt: 2 }}>
                <ExternalLink title="See external profile" href={delegate.externalUrl} target="_blank">
                  <Text sx={{ fontSize: 1 }}>
                    See external profile
                    <Icon ml={2} name="arrowTopRight" size={2} />
                  </Text>
                </ExternalLink>
              </Box>
            )}
          </Box>
          <Box mt={[2, 0]}>
            <DelegateContractExpiration delegate={delegate} />
          </Box>
        </Flex>
        {/* <Box sx={{ mr: 3 }}>
          <DelegateLastVoted delegate={delegate} />
        </Box> */}
      </Box>

      <Tabs tabListStyles={{ pl: [3, 4] }} tabTitles={tabTitles} tabPanels={tabPanels}></Tabs>
    </Box>
  );
}
