import { Box, Button, Grid, Text, Link as ExternalLink } from '@theme-ui/components';
import React from 'react';
import useSWR from 'swr';
import getMaker, { getNetwork, MKR } from '../../lib/maker';
import useAccountsStore from '../../stores/accounts';
import { Delegate } from 'types/delegate';
import { getEtherscanLink } from '../../lib/utils';
import DelegatePicture from './DelegatePicture';
import Link from 'next/link';
import { useState } from 'react';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const delegateAddress = delegate.address;

  // TODO : Change approver
  const [approved, setApproved] = useState(false);

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

  const approveMkr = async () => {
    const maker = await getMaker();
    maker.getToken(MKR).approveUnlimited(delegate.address);
    setApproved(true);
  };

  const lockMkr = async () => {
    const maker = await getMaker();
    await maker.service('voteDelegate').lock(delegate.address, 0.1);
  };

  const approveIou = async () => {
    const maker = await getMaker();
    maker.getToken('IOU').approveUnlimited(delegate.address);
  };

  const freeMkr = async () => {
    const maker = await getMaker();
    await maker.service('voteDelegate').free(delegate.address, 0.1);
  };

  return (
    <Box sx={{ flexDirection: 'row', justifyContent: 'space-between', variant: 'cards.primary' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex' }}>
            <DelegatePicture delegate={delegate} />

            <Box sx={{ ml: 2 }}>
              <Text variant="microHeading" sx={{ fontSize: [3, 5], maxWidth: '250px' }}>
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
                {!approved ? (
                  <Button onClick={approveMkr} sx={{ width: '150px' }}>
                    Approve
                  </Button>
                ) : (
                  <Button onClick={lockMkr} sx={{ width: '150px' }}>
                    Delegate
                  </Button>
                )}
              </Box>
              <Box>
                {!approved ? (
                  <Button onClick={approveMkr} sx={{ width: '150px' }}>
                    Approve
                  </Button>
                ) : (
                  <Button variant="outline" onClick={lockMkr} sx={{ width: '150px' }}>
                    Undelegate
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
