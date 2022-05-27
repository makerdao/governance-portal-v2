import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorName } from './connectors';

export interface WalletInfo {
  connector: AbstractConnector;
  name: ConnectorName;
  mobile: boolean;
}
