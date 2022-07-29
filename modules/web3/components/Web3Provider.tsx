import { ReactNode, useEffect } from 'react';
import { Connector } from '@web3-react/types';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
// import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../connectors/coinbaseWallet'
import { hooks as metaMaskHooks, metaMask } from 'modules/web3/connectors/metaMask';
import { hooks as networkHooks, network } from 'modules/web3/connectors/network';
import { hooks as gnosisSafeHooks, gnosisSafe } from 'modules/web3/connectors/gnosisSafe';
import { SupportedConnector } from '../constants/connectors';
// import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect'

// const connectors: [MetaMask | WalletConnect | CoinbaseWallet | Network, Web3ReactHooks][] = [
const connectors: [SupportedConnector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [gnosisSafe, gnosisSafeHooks],
  // [walletConnect, walletConnectHooks],
  // [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks]
];

const connect = async (connector: Connector) => {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`);
  }
};

export function Web3Provider({ children }: { children: ReactNode }): JSX.Element {
  // const isMetaMask = !!window.ethereum?.isMetaMask;

  useEffect(() => {
    connect(gnosisSafe);
    connect(network);
    connect(metaMask);
  }, []);

  return <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>;
}
