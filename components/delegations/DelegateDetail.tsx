/** @jsx jsx */
import React from 'react';
import { jsx, Box, Text, Link as ExternalLink, Divider, Flex, Heading } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import { Delegate } from 'types/delegate';
import { DelegatePicture, DelegateContractExpiration, DelegateLastVoted } from 'components/delegations';
import { Icon } from '@makerdao/dai-ui-icons';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { AddressPollVoteHistory } from 'modules/address/components/AddressPollVoteHistory';

type PropTypes = {
  delegate: Delegate;
  stats: AddressAPIStats;
};

export function DelegateDetail({ delegate, stats }: PropTypes): React.ReactElement {
  const bpi = useBreakpointIndex();

  const { voteDelegateAddress } = delegate;

  return (
    <Box sx={{ variant: 'cards.primary', p: [0, 0] }}>
      <Box sx={{ p: 3 }}>
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
                  {voteDelegateAddress}
                </Text>
              </ExternalLink>
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
      <Box sx={{ p: 3 }}>
        <div
          sx={{ variant: 'markdown.default' }}
          dangerouslySetInnerHTML={{ __html: delegate.description }}
        />
      </Box>

      <Divider my={0} />
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
        {/* <Box sx={{ mr: 3 }}>
          <DelegateLastVoted delegate={delegate} />
        </Box> */}
        <DelegateContractExpiration delegate={delegate} />
        <Flex sx={{ mt: 3, flexDirection: 'column' }}>
          <Heading>Polling Vote History</Heading>
          <AddressPollVoteHistory votes={stats.pollVoteHistory} />
        </Flex>
      </Box>
    </Box>
  );
}
