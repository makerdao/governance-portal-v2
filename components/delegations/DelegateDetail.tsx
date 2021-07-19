/** @jsx jsx */
import { jsx, Box, Text, Link as ExternalLink, Divider } from 'theme-ui';
import React from 'react';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import { Delegate } from 'types/delegate';
import { DelegatePicture, DelegateContractExpiration, DelegateLastVoted } from 'components/delegations';

type PropTypes = {
  delegate: Delegate;
};

export function DelegateDetail({ delegate }: PropTypes): React.ReactElement {
  const { voteDelegateAddress } = delegate;
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
            href={getEtherscanLink(getNetwork(), voteDelegateAddress, 'address')}
            target="_blank"
          >
            <Text as="p">
              {voteDelegateAddress.substr(0, 6)}...
              {voteDelegateAddress.substr(voteDelegateAddress.length - 5, voteDelegateAddress.length - 1)}
            </Text>
          </ExternalLink>
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>
        <div
          sx={{ variant: 'markdown.default' }}
          dangerouslySetInnerHTML={{ __html: delegate.description }}
        />
      </Box>

      <Divider my={0} />
      <Box sx={{ p: 3, display: 'flex' }}>
        {/* <Box sx={{ mr: 3 }}>
          <DelegateLastVoted delegate={delegate} />
        </Box> */}
        <DelegateContractExpiration delegate={delegate} />
      </Box>
    </Box>
  );
}
