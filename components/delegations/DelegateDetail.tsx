import { Box, Button, Text, Link as ExternalLink } from '@theme-ui/components';
import React from 'react';
import { Delegate } from 'types/delegate';
import { getEtherscanLink } from '../../lib/utils';
import DelegatePicture from './DelegatePicture';
import { getNetwork } from '../../lib/maker';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateDetail({ delegate }: PropTypes): React.ReactElement {

  return (
    <Box sx={{ flexDirection: 'row', justifyContent: 'space-between', variant: 'cards.primary' }}>
      <Box>
        <Box sx={{ display: 'flex' }}>
          <DelegatePicture delegate={delegate} />

          <Box sx={{ ml: 2 }}>
            <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
              {delegate.name}
            </Text>
            <ExternalLink
              title="View on etherescan"
              href={getEtherscanLink(getNetwork(), delegate.address, 'address')}
              target="_blank"
            >
              <Text>
                {delegate.address.substr(0, 6)}...
                {delegate.address.substr(delegate.address.length - 5, delegate.address.length - 1)}
              </Text>
            </ExternalLink>
          </Box>
        </Box>

        <Text
          sx={{
            fontSize: [2, 3],
            color: 'textSecondary',
            mt: 1
          }}
        >
          {delegate.description}
        </Text>
        
      </Box>
    </Box>
  );
}
