/** @jsx jsx */

import React, { useState } from 'react';
import { Box, Button, Grid, Text, Link as ExternalLink, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import Link from 'next/link';

import { getNetwork } from 'lib/maker';
import { useLockedMkr, useMkrDelegated } from 'lib/hooks';
import { limitString } from 'lib/string';
import { getEtherscanLink } from 'lib/utils';
import { DelegateStatusEnum } from 'lib/delegates/constants';
import useAccountsStore from 'stores/accounts';
import { Delegate } from 'types/delegate';
import {
  DelegatePicture,
  DelegateModal,
  UndelegateModal,
  DelegateLastVoted,
  DelegateContractExpiration
} from 'components/delegations';

type PropTypes = {
  delegate: Delegate;
};

export function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  const bpi = useBreakpointIndex();
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;

  const { data: totalStaked } = useLockedMkr(delegate.voteDelegateAddress);

  const { data: mkrStaked } = useMkrDelegated(address, delegate.voteDelegateAddress);

  const showLinkToDetail = delegate.status === DelegateStatusEnum.active && !delegate.expired;

  return (
    <Box sx={{ variant: 'cards.primary' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', mr: [0, 2] }}>
            <DelegatePicture delegate={delegate} />

            <Box sx={{ ml: 2 }}>
              <Box>
                <Text variant="microHeading" sx={{ fontSize: [3, 5], maxWidth: '250px' }}>
                  {delegate.name ? limitString(delegate.name, 16, '...') : 'Unknown'}
                </Text>
              </Box>
              <ExternalLink
                title="View on etherescan"
                href={getEtherscanLink(getNetwork(), delegate.voteDelegateAddress, 'address')}
                target="_blank"
              >
                <Text>
                  {delegate.voteDelegateAddress.substr(0, 6)}...
                  {delegate.voteDelegateAddress.substr(
                    delegate.voteDelegateAddress.length - 5,
                    delegate.voteDelegateAddress.length - 1
                  )}
                </Text>
              </ExternalLink>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            {showLinkToDetail && (
              <Link href={`/delegates/${delegate.voteDelegateAddress}`}>
                <a title="Profile details">
                  <Button sx={{ borderColor: 'text', width: '169px', color: 'text' }} variant="outline">
                    View Profile Details
                  </Button>
                </a>
              </Link>
            )}

            {!showLinkToDetail && (
              <Box>
                <DelegateLastVoted delegate={delegate} />
                <DelegateContractExpiration delegate={delegate} />
              </Box>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: bpi > 1 ? 'auto' : '100%',
            marginTop: bpi > 1 ? 0 : 4
          }}
        >
          <Grid
            columns={[2]}
            sx={{
              width: bpi > 1 ? 'auto' : '100%',
              marginBottom: bpi > 1 ? 0 : 4
            }}
          >
            <Box sx={{ mr: [4] }}>
              <Box sx={{ mb: 3 }}>
                <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {totalStaked ? totalStaked.toBigNumber().toFormat(2) : '0.00'}
                </Text>
                <Text as="p" variant="secondary" color="onSecondary">
                  Total MKR delegated
                </Text>
              </Box>
              <Box>
                <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5], color: 'secondaryMuted' }}>
                  Untracked
                </Text>
                <Text as="p" variant="secondary" color="onSecondary">
                  Pool participation
                </Text>
              </Box>
            </Box>

            <Box sx={{ mr: [0, 0, 4] }}>
              <Box sx={{ mb: 3 }}>
                <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
                </Text>
                <Text as="p" variant="secondary" color="onSecondary">
                  MKR delegated by you
                </Text>
              </Box>
              <Box>
                <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5], color: 'secondaryMuted' }}>
                  Untracked
                </Text>
                <Text as="p" variant="secondary" color="onSecondary">
                  Executive participation
                </Text>
              </Box>
            </Box>
          </Grid>

          <Box
            sx={{
              textAlign: 'right',
              width: ['100%', '100%', 'auto'],
              display: ['flex', 'flex', 'block'],
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Button
                variant="primaryLarge"
                disabled={!account}
                onClick={() => setShowDelegateModal(true)}
                sx={{ width: '150px' }}
              >
                Delegate
              </Button>
            </Box>
            <Box>
              <Button
                variant="primaryOutline"
                disabled={!account}
                onClick={() => setShowUndelegateModal(true)}
                sx={{ width: '150px' }}
              >
                Undelegate
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <DelegateModal
        delegate={delegate}
        isOpen={showDelegateModal}
        onDismiss={() => setShowDelegateModal(false)}
      />
      <UndelegateModal
        delegate={delegate}
        isOpen={showUndelegateModal}
        onDismiss={() => setShowUndelegateModal(false)}
      />
    </Box>
  );
}
