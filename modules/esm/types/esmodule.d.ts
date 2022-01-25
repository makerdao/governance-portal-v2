import CurrencyObject from './currency';

type ESModuleObject = {
  totalStaked: () => CurrencyObject;
  thresholdAmount: () => CurrencyObject;
  fired: () => boolean;
  mkrInEsm: () => CurrencyObject;
  cageTime: () => string;
  // toString: () => string;
  // toBigNumber: () => any;
  mul: (n: string | number | CurrencyObject) => CurrencyObject;
  // div: (divisor: string | number | CurrencyObject) => CurrencyObject;
  // sub: (n: string | number | CurrencyObject) => CurrencyObject;
  // add: (n: string | number | CurrencyObject) => CurrencyObject;
  gte: (n: string | number | CurrencyObject) => boolean;
  gt: (n: string | number | CurrencyObject) => boolean;
  // eq: (n: string | number | CurrencyObject) => boolean;
  // lt: (n: string | number | CurrencyObject) => boolean;
  // toFixed: (precision?: number) => string;
  // toNumber: () => number;
  // symbol: string;
};

export default ESModuleObject;

export type StakingHistoryRow = {
  transactionHash: string;
  senderAddress: string;
  amount: CurrencyObject;
  time: string;
};
