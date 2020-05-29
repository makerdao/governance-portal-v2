import remark from 'remark';
import html from 'remark-html';
import invariant from 'tiny-invariant';

import { MKR } from './maker';
import CurrencyObject from '../types/currency';
import PollTally from '../types/pollTally';
import Poll from '../types/poll';
import { SupportedNetworks, ETHERSCAN_PREFIXES } from './constants';

export function bigNumberKFormat(num: CurrencyObject) {
  invariant(num && num.symbol && num.toBigNumber, 'bigNumberKFormat must recieve a maker currency object');
  const units = ['k', 'm', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  let typeIndex = Math.floor(num.toFixed(0).length / 3) - 1;
  typeIndex = typeIndex >= units.length ? 7 : typeIndex; // if the number out of range
  const noUnit = typeIndex <= 0; // if the number is smaller than 100,000
  const value = noUnit ? num : num.div(Math.pow(1000, typeIndex));
  invariant(value, 'bigNumberKFormat value undefined');
  return `${value.toBigNumber().toFixed(0)} ${noUnit ? '' : units[typeIndex - 1]}`;
}

export async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(html)
    .process(markdown);
  return result.toString();
}

export function timeoutPromise(ms: number, promise: Promise<any>): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject('promise timeout');
    }, ms);
    promise.then(
      res => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      err => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}

export function wait(duration: number) {
  return new Promise(res => setTimeout(res, duration));
}

export function backoffRetry(retries: number, fn: () => Promise<any>, delay = 500): Promise<any> {
  return fn().catch(err =>
    retries > 1 ? wait(delay).then(() => backoffRetry(retries - 1, fn, delay * 2)) : Promise.reject(err)
  );
}

export function parsePollTally(tally, poll: Poll): PollTally {
  const totalMkrParticipation = MKR(tally.totalMkrParticipation);
  if (tally?.winner === null) tally.winningOption = 'none found';
  else tally.winningOption = poll.options ? poll.options[tally.winner] : 'none found';
  Object.keys(tally.options).forEach(key => {
    tally.options[key].firstChoice = MKR(tally.options[key].firstChoice);
    tally.options[key].transfer = MKR(tally.options[key].transfer);
  });
  return { ...tally, totalMkrParticipation };
}

export function getEtherscanLink(
  network: SupportedNetworks,
  data: string,
  type: 'transaction' | 'address'
): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[network] ||
    ETHERSCAN_PREFIXES[SupportedNetworks.MAINNET]}etherscan.io`;

  switch (type) {
    case 'transaction':
      return `${prefix}/tx/${data}`;
    case 'address':
    default:
      return `${prefix}/address/${data}`;
  }
}
