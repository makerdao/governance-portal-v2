import getMaker from 'lib/maker';
import { useEffect, useState } from 'react';

type PrivateKeyAccount = {
  address: string;
  key: string;
};

export function useWindowBindings(): void {
  const [account, setAccount] = useState<PrivateKeyAccount>({
    address: '',
    key: ''
  });

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
        const maker = await getMaker();

        await maker.service('accounts').addAccount(`test-account-${account.address}`, {
          type: 'privateKey',
          key: account.key
        });

        maker.useAccount(`test-account-${account.address}`);
      }
    };

    changeMakerAccount();
  }, [account]);
}
