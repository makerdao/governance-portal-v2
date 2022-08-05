import { ConnectionType } from 'modules/web3/connections';
import { WalletName } from 'modules/web3/constants/wallets';

export interface WalletInfo {
  // connection: Connection;
  connectionType: ConnectionType;
  name: WalletName;
  deeplinkUri?: string;
}
