type TxStatus = 'initialized' | 'pending' | 'mined' | 'error';

type TX = {
  submittedAt: string;
  status: TxStatus;
  message: null | string;
  hash: null | string;
  error: null | string;
  errorType: null | string;
};

export { TxStatus };
export default TX;
