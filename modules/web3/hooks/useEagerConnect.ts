import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injectedConnector } from '../connectors';
import { NetworkContextName } from '../constants/networks';
import { networkConnector } from '../connectors';
import { useInactiveListener } from './useInactiveListener';

// from https://github.com/NoahZinsmeister/web3-react/tree/v6/example
export function useEagerConnect(): boolean {
  const { activate, active } = useWeb3React();
  const {
    active: networkActive,
    error: networkError,
    activate: activateNetwork
  } = useWeb3React(NetworkContextName);

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

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate it
  // TODO: This should be handled by the eager connect, that's the whole point of having it.
  useEffect(() => {
    if (tried && !networkActive && !networkError && !active) {
      activateNetwork(networkConnector);
    }
  }, [tried, networkActive, networkError, activateNetwork, active]);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!tried);

  return tried;
}
