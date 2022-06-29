import BigNumber from 'bignumber.js';

// Wrapper to enable config options globally for BigNumber.js
export default class BigNumberJS extends BigNumber.clone({
  // never use scientific notation when converting BigNumber toString
  EXPONENTIAL_AT: 1e9
}) {}

export { BigNumberJS };
