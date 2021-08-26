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
  stats: AddressAPIStats
};

export function AddressDetail({ address, stats }: PropTypes): React.ReactElement {
  const bpi = useBreakpointIndex();

  return (
    <Box sx={{ variant: 'cards.primary', p: [0, 0] }}>
      <Box sx={{ p: 3 }}>
        <Flex>
          <AddressIcon address={address} />
          <Box sx={{ width: '100%' }}>
            <Box sx={{ ml: 2 }}>

              <ExternalLink
                title="View on etherescan"
                href={getEtherscanLink(getNetwork(), address, 'address')}
                target="_blank"
              >
                <Text as="p" sx={{ fontSize: bpi > 0 ? 3 : 1 }}>
                  {address}
                </Text>
              </ExternalLink>
            </Box>
          </Box>
        </Flex>

        <Flex sx={{ mt: 3, flexDirection: 'column' }}>
          <Heading>Polling Vote History</Heading>
          <PollVoteHistoryList votes={stats.pollVoteHistory} />
        </Flex>
      </Box>
    </Box>
  );
}
