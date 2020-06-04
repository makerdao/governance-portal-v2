import { Box, Select } from 'theme-ui';
import Router from 'next/router';

import useAccountsStore from '../stores/accounts';
import { getNetwork } from '../lib/maker';

const formatAddress = address => address.slice(0, 7) + '...' + address.slice(-4);

const AccountSelect = () => {
  const currentAccount = useAccountsStore(state => state.currentAccount);
  const connectWithBrowserProvider = useAccountsStore(state => state.connectWithBrowserProvider);

  const network = getNetwork();
  const otherNetwork = network === 'mainnet' ? 'kovan' : 'mainnet';
  const switchLabel = `Switch to ${otherNetwork}`;

  const handleChange = ({ target: { value }}) => {
    if (value === 'MetaMask') {
      connectWithBrowserProvider();
    } else if (value === switchLabel) {
      if (Router?.router) {
        Router.push({
          pathname: Router.router.pathname,
          query: { network: otherNetwork }
        });
      }
    }
  };

  return (
    <Box>
      <Select
        value={'Connect wallet'}
        onChange={handleChange}
        sx={{ width: '6', fontSize: '2' }}
      >
        {currentAccount ? (
          <option defaultValue={formatAddress(currentAccount.address)}>
            {formatAddress(currentAccount.address)}
          </option>
        ) : (
          <>
            <option>Connect wallet</option>
            <option>MetaMask</option>
          </>
        )}
        <option>{switchLabel}</option>
      </Select>
    </Box>
  );
};

export default AccountSelect;
