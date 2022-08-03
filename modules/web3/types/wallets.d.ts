import { Connection, ConnectionName } from '../connections';

export interface WalletInfo {
  connection: Connection;
  name: ConnectionName;
  deeplinkUri?: string;
}
