/** @jsx jsx */
import React from 'react';
import { jsx, Box, Text, Link as ExternalLink, Flex, Divider } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import AddressIcon from './AddressIcon';
import { PollVoteHistoryList } from 'modules/polling/components/PollVoteHistoryList';
import { AddressAPIStats, VoteProxyInfo } from '../types/addressApiResponse';
import Tooltip from 'components/Tooltip';
import { cutMiddle } from 'lib/string';
import { PollingParticipationOverview } from 'modules/polling/components/PollingParticipationOverview';

type PropTypes = {
  address: string;
  stats: AddressAPIStats;
  voteProxyInfo?: VoteProxyInfo;
};

export function AddressDetail({ address, stats, voteProxyInfo }: PropTypes): React.ReactElement {
  const bpi = useBreakpointIndex();

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
      <Box sx={{ p: [3, 4] }}>
        <Flex>
          <AddressIcon address={address} width="41px" />
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
                {bpi > 0 ? address : cutMiddle(address, 6, 6)}
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

      <PollVoteHistoryList votes={stats.pollVoteHistory} />

      <Box sx={{ p: [3, 4] }}>
        <Box>
          <PollingParticipationOverview votes={stats.pollVoteHistory} />
        </Box>
      </Box>
    </Box>
  );
}
