/** @jsx jsx */
import { Button, Flex, Divider, Card, jsx } from 'theme-ui';
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
    <Button variant="card" onClick={account ? () => {} : connectWithBrowserProvider}>
      {account ? (
        <span>{formatAddress(account.address)}</span>
      ) : (
        <span>Connect wallet</span>
      )}
    </Button>
  );
};

export default AccountSelect;
