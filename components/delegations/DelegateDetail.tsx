import { Box, Text, Link as ExternalLink, Divider } from '@theme-ui/components';
import React from 'react';
import { Delegate } from 'types/delegate';
import { getEtherscanLink } from 'lib/utils';
import DelegatePicture from './DelegatePicture';
import { getNetwork } from 'lib/maker';
import { DelegateContractExpiration } from './DelegateContractExpiration';
import { DelegateLastVoted } from './DelegateLastVoted';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateDetail({ delegate }: PropTypes): React.ReactElement {
  return (
    <Box sx={{ variant: 'cards.primary', p: [0, 0] }}>
      <Box sx={{ display: 'flex', p: 3 }}>
        <DelegatePicture delegate={delegate} />

        <Box sx={{ ml: 2 }}>
          <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
            {delegate.name}
          </Text>
          <ExternalLink
            title="View on etherescan"
            href={getEtherscanLink(getNetwork(), delegate.address, 'address')}
            target="_blank"
          >
            <Text as="p">
              {delegate.address.substr(0, 6)}...
              {delegate.address.substr(delegate.address.length - 5, delegate.address.length - 1)}
            </Text>
          </ExternalLink>
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>
        <div dangerouslySetInnerHTML={{ __html: delegate.description }} />
      </Box>

      <Divider my={0} />
      <Box sx={{ p: 3, display: 'flex' }}>
        <Box sx={{ mr: 3 }}>
          <DelegateLastVoted delegate={delegate} />
        </Box>
        <DelegateContractExpiration delegate={delegate} />
      </Box>
    </Box>
  );
}
