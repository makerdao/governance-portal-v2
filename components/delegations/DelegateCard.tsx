import { Box, Button, Flex, Text, Link as ExternalLink } from '@theme-ui/components';
import React from 'react';
import useSWR from 'swr';
import getMaker, { getNetwork, MKR } from '../../lib/maker';
import useAccountsStore from '../../stores/accounts';
import { Delegate } from 'types/delegate';
import { getEtherscanLink } from '../../lib/utils';
import DelegatePicture from './DelegatePicture';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateCard({ delegate }: PropTypes): React.ReactElement {
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

  const approveMkr = async () => {
    const maker = await getMaker();
    const tx = maker.getToken(MKR).approveUnlimited(delegate.address);
  };

  const lockMkr = async () => {
    const maker = await getMaker();
    const tx = await maker.service('voteDelegate').lock(delegate.address, 0.1);
  };

  const approveIou = async () => {
    const maker = await getMaker();
    const tx = maker.getToken('IOU').approveUnlimited(delegate.address);
  };

  const freeMkr = async () => {
    const maker = await getMaker();
    const tx = await maker.service('voteDelegate').free(delegate.address, 0.1);
  };

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
        <Text>Your MKR balance: {mkrBalance ? mkrBalance.toBigNumber().toFormat(2) : '0.00'}</Text>
        <Text>MKR delegated: {mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}</Text>
        <Button onClick={approveMkr}>Approve MKR</Button>
        <Button onClick={lockMkr}>Lock 0.1 MKR</Button>
        <Button onClick={approveIou}>Approve IOU</Button>
        <Button onClick={freeMkr}>Free 0.1 MKR</Button>
      </Box>
    </Box>
  );
}
