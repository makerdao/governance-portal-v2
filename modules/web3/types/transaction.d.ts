export type TxStatus = 'initialized' | 'pending' | 'mined' | 'error';
import { SupportedNetworks } from '../constants/networks';

export type TXInitialized = {
  from: string;
  status: 'initialized';
  id: string;
  submittedAt: Date;
  message: null | string;
  hash: null;
  error: null;
  errorType: null;
  gaslessNetwork?: SupportedNetworks;
};

export type TXPending = {
  from: string;
  status: 'pending';
  id: string;
  submittedAt: Date;
  message: null | string;
  hash: string;
  error: null;
  errorType: null;
  gaslessNetwork?: SupportedNetworks;
};

export type TXMined = Omit<TXPending, 'status'> & {
  status: 'mined';
};

export type TXError = {
  from: string;
  status: 'error';
  id: string;
  submittedAt: Date;
  message: null | string;
  hash: null | string;
  error: null | string;
  errorType: string;
  gaslessNetwork?: SupportedNetworks;
};

export type Transaction = TXInitialized | TXPending | TXMined | TXError;
