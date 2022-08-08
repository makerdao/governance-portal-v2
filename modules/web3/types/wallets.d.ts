import { WalletName, ConnectionType } from 'modules/web3/constants/wallets';

export interface WalletInfo {
  connectionType: ConnectionType;
  name: WalletName;
  deeplinkUri?: string;
}
