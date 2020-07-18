/** @jsx jsx */
import { Button, Flex, Divider, Card, jsx } from 'theme-ui';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

import useAccountsStore from '../stores/accounts';
import getMaker, { getNetwork } from '../lib/maker';
import { useEffect } from 'react';

const formatAddress = (address: string) => address.slice(0, 7) + '...' + address.slice(-4);

const injectedConnector = new InjectedConnector({ supportedChainIds: [1, 42] });

const WrappedAccountSelect = () => {
  return <Web3ReactProvider getLibrary={(provider, connector) => ({ provider, connector })}>
    <AccountSelect />
  </Web3ReactProvider>;
};

const AccountSelect = () => {
  const web3ReactContext = useWeb3React();
  const { connector, library, chainId, account, activate, deactivate, active, error } = web3ReactContext;

  // FIXME there must be a more direct way to get web3-react & maker to talk to each other
  useEffect(() => {
    (async () => {
      if (!library || !account) return;
      const maker = await getMaker();
      const accounts = maker.listAccounts();
      console.log(accounts);
      if (accounts.some(a => a.address.toLowerCase() === account.toLowerCase())) {
        maker.useAccountWithAddress(account);
      } else {
        await maker.addAccount({ type: 'web3-react', library, address: account });
      }
    })();
  }, [library, account]);

  return (
    <Button variant="card" onClick={() => activate(injectedConnector)}>
      {account ? (
        <Flex sx={{ flexDirection: 'column' }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <span>MetaMask</span>
            <span>{formatAddress(account)}</span>
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
    </Button>
  );
};

export default WrappedAccountSelect;
