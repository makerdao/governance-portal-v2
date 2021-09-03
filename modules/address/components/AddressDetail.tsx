/** @jsx jsx */
import React from 'react';
import { jsx, Box, Text, Link as ExternalLink, Flex, Heading } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import AddressIcon from './AddressIcon';
import { PollVoteHistoryList } from 'modules/polls/components/PollVoteHistoryList';
import { AddressAPIStats } from '../types/addressApiResponse';

type PropTypes = {
  address: string;
  stats: AddressAPIStats;
  isProxyContract: boolean;
};

export function AddressDetail({ address, stats, isProxyContract }: PropTypes): React.ReactElement {
  const bpi = useBreakpointIndex();

  return (
    <Box sx={{ variant: 'cards.primary', p: [0, 0] }}>
      <Box sx={{ p: 3 }}>
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
              <Text as="p" sx={{ fontSize: [1, 3] }}>
                {address}
              </Text>
            </ExternalLink>
            {isProxyContract && <Text sx={{ color: 'textSecondary', fontSize: [1, 2] }}>Proxy Contract</Text>}
          </Flex>
        </Flex>

        <Flex sx={{ mt: 3, flexDirection: 'column' }}>
          <Heading>Polling Vote History</Heading>
          <PollVoteHistoryList votes={stats.pollVoteHistory} />
        </Flex>
      </Box>
    </Box>
  );
}
