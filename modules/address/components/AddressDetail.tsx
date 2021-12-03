import React from 'react';
import { Box, Text, Link as ExternalLink, Flex, Divider } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import AddressIcon from './AddressIcon';
import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressAPIStats, VoteProxyInfo } from '../types/addressApiResponse';
import Tooltip from 'modules/app/components/Tooltip';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';
import { Address } from './Address';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import LastVoted from 'modules/polling/components/LastVoted';
import AddressDelegatedTo from './AddressDelegatedTo';

type PropTypes = {
  address: string;
  voteProxyInfo?: VoteProxyInfo;
};

export function AddressDetail({ address, voteProxyInfo }: PropTypes): React.ReactElement {
  const { data: statsData } = useSWR<AddressAPIStats>(
    `/api/address/${address}/stats?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  const tooltipLabel = voteProxyInfo ? (
    <Box sx={{ p: 2 }}>
      <Text as="p">
        <Text sx={{ fontWeight: 'bold' }}>Contract:</Text> {voteProxyInfo.voteProxyAddress}
      </Text>
      <Text as="p">
        <Text sx={{ fontWeight: 'bold' }}>Hot:</Text> {voteProxyInfo.hot}
      </Text>
      <Text as="p">
        <Text sx={{ fontWeight: 'bold' }}>Cold:</Text> {voteProxyInfo.cold}
      </Text>
    </Box>
  ) : null;
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
        <Flex>
          <Box sx={{ width: '52px', mr: 2 }}>
            <AddressIcon address={address} width="52px" />
          </Box>
          <Flex
            sx={{
              ml: 2,
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <ExternalLink
              title="View on etherescan"
              href={getEtherscanLink(getNetwork(), address, 'address')}
              target="_blank"
            >
              <Text as="p" sx={{ fontSize: [1, 3], ml: 2 }}>
                <Address address={address} />
              </Text>
            </ExternalLink>
            {voteProxyInfo && (
              <Flex>
                <Text sx={{ color: 'textSecondary', ml: 2, fontSize: [1, 2] }}>Proxy Contract</Text>{' '}
                <Tooltip label={tooltipLabel}>
                  <Box>
                    <Icon name="question" ml={2} mt={['2px', '4px']} />
                  </Box>
                </Tooltip>{' '}
              </Flex>
            )}
          </Flex>
        </Flex>

        <Box sx={{ pt: [2, 0] }}>
          <LastVoted expired={false} date={statsData?.lastVote?.blockTimestamp || ''} />
        </Box>
      </Flex>

      <Divider mt={1} mb={1} />

      <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4] }}>
        <Text
          as="p"
          sx={{
            fontSize: 4,
            fontWeight: 'semiBold'
          }}
        >
          Delegates
        </Text>
        <Divider mt={3} />
      </Box>
      <Box sx={{ pl: [3, 4], pr: [3, 4], pt: [3, 4] }}>
        <AddressDelegatedTo delegatedTo={statsData?.delegatedTo} />
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
      </Box>

      {statsData && <PollVoteHistoryList votes={statsData.pollVoteHistory} />}

      {statsData && <PollingParticipationOverview votes={statsData.pollVoteHistory} />}
    </Box>
  );
}
