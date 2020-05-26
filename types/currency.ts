type CurrencyObject = {
  toString: () => string;
  toBigNumber: () => any;
  mul: (divisor: string | number | CurrencyObject) => CurrencyObject;
  div: (divisor: string | number | CurrencyObject) => CurrencyObject;
  sub: (divisor: string | number | CurrencyObject) => CurrencyObject;
  add: (divisor: string | number | CurrencyObject) => CurrencyObject;
  toFixed: (precision?: number) => string;
  symbol: string;
};

export default CurrencyObject;
