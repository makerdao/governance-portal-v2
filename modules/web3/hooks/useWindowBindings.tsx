import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { PrivateKeyConnector } from '../connectors/PrivateKeyConnector';

type PrivateKeyAccount = {
  address: string;
  key: string;
};

export function useWindowBindings(): void {
  const [account, setAccount] = useState<PrivateKeyAccount>({
    address: '',
    key: ''
  });

  const context = useWeb3React();
  // Define a window function that changes the account for testing purposes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setAccount = (address: string, key: string) => {
        setAccount({
          address,
          key
        });
      };
    }
  }, []);

  useEffect(() => {
    const changeMakerAccount = async () => {
      if (account.address && account.key) {
        const connector = new PrivateKeyConnector(account.key, account.address);

        context.activate(connector);
      }
    };

    changeMakerAccount();
  }, [account]);
}
