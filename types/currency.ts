type CurrencyObject = {
  toString: () => string;
  toBigNumber: () => any;
  mul: (n: string | number | CurrencyObject) => CurrencyObject;
  div: (divisor: string | number | CurrencyObject) => CurrencyObject;
  sub: (n: string | number | CurrencyObject) => CurrencyObject;
  add: (n: string | number | CurrencyObject) => CurrencyObject;
  toFixed: (precision?: number) => string;
  toNumber: () => number;
  symbol: string;
};

export default CurrencyObject;
