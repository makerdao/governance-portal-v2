import { Box, Button, Grid, Text, Link as ExternalLink } from '@theme-ui/components';
import React from 'react';
import useSWR from 'swr';
import getMaker, { getNetwork, MKR } from '../../lib/maker';
import useAccountsStore from '../../stores/accounts';
import { Delegate } from '../../types/delegate';
import { getEtherscanLink } from '../../lib/utils';
import DelegatePicture from './DelegatePicture';
import Link from 'next/link';
import { useState } from 'react';
import DelegateModal from './DelegateModal';
import UndelegateModal from './UndelegateModal';
import { limitString } from '../../lib/string';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const delegateAddress = delegate.address;

  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

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

  return (
    <Box sx={{ variant: 'cards.primary' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex' }}>
            <DelegatePicture delegate={delegate} />

            <Box sx={{ ml: 2 }}>
              <Text variant="microHeading" sx={{ fontSize: [3, 5], maxWidth: '250px' }}>
                {limitString(delegate.name, 16, '...')}
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

          <Box sx={{ mt: 3 }}>
            <Link href={`/delegates/${delegate.address}`}>
              <a title="Profile details">
                <Button sx={{ borderColor: 'text', width: '169px', color: 'text' }} variant="outline">
                  View Profile Details
                </Button>
              </a>
            </Link>
          </Box>
        </Box>

        <Box>
          <Grid columns={3}>
            <Box sx={{ mr: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
                </Text>
                <Text variant="secondary">Total MKR delegated</Text>
              </Box>
              <Box>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  0.51%
                </Text>
                <Text variant="secondary">Pool participation</Text>
              </Box>
            </Box>

            <Box sx={{ mr: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {mkrBalance ? mkrBalance.toBigNumber().toFormat(2) : '0.00'}
                </Text>
                <Text variant="secondary">MKR delegated by you</Text>
              </Box>
              <Box>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  23.23%
                </Text>
                <Text variant="secondary">Executive participation</Text>
              </Box>
            </Box>

            <Box>
              <Box sx={{ mb: 3 }}>
                <Button onClick={() => setShowDelegateModal(true)} sx={{ width: '150px' }}>
                  Delegate
                </Button>
              </Box>
              <Box>
                <Button
                  variant="outline"
                  onClick={() => setShowUndelegateModal(true)}
                  sx={{ width: '150px' }}
                >
                  Undelegate
                </Button>
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>

      {/* TODO: consider using same component for both delegate + undelegate */}
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
