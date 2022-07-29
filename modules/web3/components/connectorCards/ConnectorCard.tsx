import { Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { GnosisSafe } from '@web3-react/gnosis-safe';
import { Network } from '@web3-react/network';
import type { Connector } from '@web3-react/types';
import { Accounts } from '../Accounts';
import { Chain } from '../Chain';
import { ConnectWithSelect } from '../ConnectWithSelect';
import { Status } from '../Status';
import { SupportedConnector } from 'modules/web3/constants/connectors';

interface Props {
  connector: SupportedConnector;
  chainId: ReturnType<Web3ReactHooks['useChainId']>;
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>;
  isActive: ReturnType<Web3ReactHooks['useIsActive']>;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>;
  provider?: ReturnType<Web3ReactHooks['useProvider']>;
  accounts?: string[];
}

const getName = (connector: Connector) => {
  if (connector instanceof MetaMask) return 'MetaMask';
  // if (connector instanceof WalletConnect) return 'WalletConnect'
  // if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof Network) return 'Network';
  if (connector instanceof GnosisSafe) return 'Gnosis Safe';
  return 'Unknown';
};

export function ConnectorCard({
  connector,
  chainId,
  isActivating,
  isActive,
  error,
  setError,
  ENSNames,
  accounts,
  provider
}: Props): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '20rem',
        padding: '1rem',
        margin: '1rem',
        overflow: 'auto',
        border: '1px solid',
        borderRadius: '1rem'
      }}
    >
      <b>{getName(connector)}</b>
      <div style={{ marginBottom: '1rem' }}>
        <Status isActivating={isActivating} isActive={isActive} error={error} />
      </div>
      <Chain chainId={chainId} />
      <div style={{ marginBottom: '1rem' }}>
        <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} />
      </div>
      <ConnectWithSelect
        connector={connector}
        chainId={chainId}
        isActivating={isActivating}
        isActive={isActive}
        error={error}
        setError={setError}
      />
    </div>
  );
}
