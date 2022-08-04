import { Connection } from 'modules/web3/connections';
import { WalletName } from 'modules/web3/constants/wallets';

export interface WalletInfo {
  connection: Connection;
  name: WalletName;
  deeplinkUri?: string;
}
