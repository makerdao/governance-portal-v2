export type TxStatus = 'initialized' | 'pending' | 'mined' | 'error';

export type TXInitialized = {
  from: string;
  status: 'initialized';
  id: string;
  submittedAt: Date;
  message: null | string;
  hash: null;
  error: null;
  errorType: null;
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
};

type TX = TXInitialized | TXPending | TXMined | TXError;

export default TX;
