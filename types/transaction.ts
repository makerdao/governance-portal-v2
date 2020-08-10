export type TxStatus = 'initialized' | 'pending' | 'mined' | 'error';

type TX = {
  from: string;
  status: TxStatus;
  id: string;
  submittedAt: Date;
  message: null | string;
  hash: null | string;
  error: null | string;
  errorType: null | string;
};

export default TX;
