export type CurrencyObject = {
  toString: (decimals?: number) => string;
  toBigNumber: () => any;
  mul: (n: string | number | CurrencyObject) => CurrencyObject;
  div: (divisor: string | number | CurrencyObject) => CurrencyObject;
  sub: (n: string | number | CurrencyObject) => CurrencyObject;
  add: (n: string | number | CurrencyObject) => CurrencyObject;
  gt: (n: string | number | CurrencyObject) => boolean;
  gte: (n: string | number | CurrencyObject) => boolean;
  eq: (n: string | number | CurrencyObject) => boolean;
  lt: (n: string | number | CurrencyObject) => boolean;
  lte: (n: string | number | CurrencyObject) => boolean;
  toFixed: (precision?: number) => string;
  toNumber: () => number;
  symbol: string;
};
