/** @jsx jsx */
import { Button, Flex, Divider, jsx } from 'theme-ui';
import Router from 'next/router';

import useAccountsStore from '../stores/accounts';
import { getNetwork } from '../lib/maker';

const formatAddress = (address: string) => address.slice(0, 7) + '...' + address.slice(-4);

const AccountSelect = () => {
  const account = useAccountsStore(state => state.currentAccount);
  const connectWithBrowserProvider = useAccountsStore(state => state.connectWithBrowserProvider);

  const network = getNetwork();
  const otherNetwork = network === 'mainnet' ? 'kovan' : 'mainnet';
  const switchLabel = `Switch to ${otherNetwork}`;

  const handleChange = (e: { target: { value: string } }) => {
    if (e.target.value === 'MetaMask') {
      connectWithBrowserProvider();
    } else if (e.target.value === switchLabel) {
      if (Router?.router) {
        Router.push({
          pathname: Router.router.pathname,
          query: { network: otherNetwork }
        });
      }
    }
  };

  return (
    <Button sx={{ variant: 'buttons.card' }}>
      <div sx={{ variant: 'cards.tight' }}>
        {account ? (
          <Flex sx={{ flexDirection: 'column' }}>
            <Flex sx={{ justifyContent: 'space-between' }}>
              <span>MetaMask</span>
              <span>{formatAddress(account.address)}</span>
            </Flex>
            <Divider mx={-2} />
            <Flex sx={{ justifyContent: 'space-between' }}>
              <span>Polling Balance</span>
              <span>333 MKR</span>
            </Flex>
          </Flex>
        ) : (
          <span>Connect wallet</span>
        )}
      </div>
    </Button>
  );
};

export default AccountSelect;
