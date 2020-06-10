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

export function parsePollTally(rawTally, poll: Poll): PollTally {
  invariant(rawTally?.totalMkrParticipation, 'invalid or undefined raw tally');
  const totalMkrParticipation = MKR(rawTally.totalMkrParticipation);

  if (rawTally?.winner === null) rawTally.winningOption = 'none found';
  else rawTally.winningOption = poll.options ? poll.options[rawTally.winner] : 'none found';

  Object.keys(rawTally.options).forEach(key => {
    rawTally.options[key].firstChoice = MKR(rawTally.options[key].firstChoice);
    rawTally.options[key].transfer = MKR(rawTally.options[key].transfer);
  });
  return { ...rawTally, totalMkrParticipation };
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

export function isActivePoll(poll: Poll): boolean {
  const hasStarted = new Date(poll.startDate).getTime() <= Date.now();
  const hasNotEnded = new Date(poll.endDate).getTime() >= Date.now();
  return hasStarted && hasNotEnded;
}

export async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok) throw new Error(`${response.statusText}: ${json.error?.message || JSON.stringify(json)}`);
  return json;
}

// https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
export function slugify(string: string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
