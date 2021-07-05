/** @jsx jsx */

import { Box, Button, Grid, Text, Link as ExternalLink, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import React from 'react';
import useSWR from 'swr';
import getMaker, { getNetwork, MKR } from 'lib/maker';
import useAccountsStore from 'stores/accounts';
import { Delegate } from 'types/delegate';
import { getEtherscanLink } from 'lib/utils';
import DelegatePicture from './DelegatePicture';
import Link from 'next/link';
import { useState } from 'react';
import DelegateModal from './modals/DelegateModal';
import UndelegateModal from './modals/UndelegateModal';
import { limitString } from 'lib/string';
import { DelegateStatusEnum } from 'lib/delegates/constants';
import { DelegateLastVoted } from './DelegateLastVoted';
import { DelegateContractExpiration } from './DelegateContractExpiration';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  const bpi = useBreakpointIndex();
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const delegateAddress = delegate.voteDelegateAddress;

  const { data: mkrStaked, error } = useSWR(
    ['/user/mkr-delegated', delegateAddress, address],
    async (_, delegateAddress, address) => {
      const maker = await getMaker();

      const balance = await maker
        .service('voteDelegate')
        .getStakedBalanceForAddress(delegateAddress, address)
        .then(MKR.wei);

      return balance;
    }
  );

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
                  {mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
                </Text>
                <Text as="p" variant="secondary" color="onSecondary">
                  Total MKR delegated
                </Text>
              </Box>
              <Box>
                <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  --
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
                <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  --
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
