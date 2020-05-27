import { Box, Select } from 'theme-ui';

import useAccountsStore from '../stores/accounts';

const formatAddress = address =>
  address.slice(0, 7) + '...' + address.slice(-4);

const AccountSelect: React.FC = () => {
  const currentAccount = useAccountsStore(state => state.currentAccount);
  const connectWithBrowserProvider = useAccountsStore(
    state => state.connectWithBrowserProvider
  );

  return (
    <Box>
      <Select
        value={'Connect wallet'}
        onChange={e => {
          if (e.target.value === 'MetaMask') {
            connectWithBrowserProvider();
          }
        }}
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
      </Select>
    </Box>
  );
};

export default AccountSelect;
