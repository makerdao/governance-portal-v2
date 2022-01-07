import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injectedConnector } from '../web3.constants';

// from https://github.com/NoahZinsmeister/web3-react/tree/v6/example
export function useEagerConnect(): void {
  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  useEffect(() => {
    injectedConnector.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injectedConnector, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, []); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag

  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);
}
