/** @jsx jsx */
import React from 'react';
import { jsx, Box, Text, Link as ExternalLink, Flex } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import AddressIcon from './AddressIcon';

type PropTypes = {
  address: string;
};

export function AddressDetail({ address }: PropTypes): React.ReactElement {
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
      </Box>
    </Box>
  );
}
