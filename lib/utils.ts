import remark from 'remark';
import html from 'remark-html';
import invariant from 'tiny-invariant';
import { cloneElement } from 'react';
import { jsx, SxStyleProp } from 'theme-ui';
import { css } from '@theme-ui/css';

import { MKR } from './maker';
import CurrencyObject from '../types/currency';
import PollTally from '../types/pollTally';
import Poll from '../types/poll';
import SpellStateDiff from '../types/spellStateDiff';
import { SupportedNetworks, ETHERSCAN_PREFIXES } from './constants';

export function bigNumberKFormat(num: CurrencyObject) {
  invariant(num && num.symbol && num.toBigNumber, 'bigNumberKFormat must recieve a maker currency object');
  const units = ['k', 'm', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  let typeIndex = Math.floor(num.div(10).toFixed(0).length / 3) - 1;
  typeIndex = typeIndex >= units.length ? 7 : typeIndex; // if the number out of range
  const noUnit = typeIndex < 0; // if the number is smaller than 1,000
  const value = noUnit ? num : num.div(Math.pow(1000, typeIndex + 1));
  invariant(value, 'bigNumberKFormat value undefined');
  return `${value.toBigNumber().toFixed(2)} ${noUnit ? '' : units[typeIndex]}`;
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
  else rawTally.winningOptionName = poll.options[rawTally.winner];

  const results = Object.keys(poll.options)
    .map(key => {
      return {
        optionId: key,
        optionName: poll.options[key],
        firstChoice: MKR(rawTally.options?.[key]?.firstChoice || 0),
        transfer: MKR(rawTally.options?.[key]?.transfer || 0),
        eliminated: rawTally.options?.[key]?.eliminated ?? true,
        winner: rawTally.options?.[key]?.winner ?? false
      };
    })
    .sort((a, b) => {
      const valueA = a.firstChoice.add(a.transfer);
      const valueB = b.firstChoice.add(b.transfer);
      if (valueA.eq(valueB)) return a.optionName > b.optionName ? 1 : -1;
      return valueA.gt(valueB) ? -1 : 1;
    });

  delete rawTally.options;
  return { ...rawTally, results, totalMkrParticipation };
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
  const now = Date.now();
  if (new Date(poll.endDate).getTime() < now) return false;
  if (new Date(poll.startDate).getTime() > now) return false;
  return true;
}

export async function fetchJson(url: RequestInfo, init?: RequestInit): Promise<any> {
  const response = await fetch(url, init);
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

/** Add sx styles to the passed in component. Provided styles override component styles if there's a clash. */
export function styledClone(component, { sx: stylesToMerge }: { sx: SxStyleProp }): React.ReactNode {
  if ('css' in component.props) {
    return cloneElement(component, {
      css: theme => [component.props.css(theme), css(stylesToMerge)(theme)]
    });
  } else {
    const { sx, ...componentProps } = component.props;
    return jsx(component.type, {
      key: component.key,
      ...componentProps,
      css: theme => [css(sx instanceof Function ? sx(theme) : sx)(theme), css(stylesToMerge)(theme)]
    });
  }
}

export function parseSpellStateDiff(rawStateDiff): SpellStateDiff {
  invariant(
    rawStateDiff?.hasBeenCast !== undefined && rawStateDiff?.decodedDiff !== undefined,
    'invalid or undefined raw state diff'
  );

  const { hasBeenCast, executedOn, decodedDiff = [] } = rawStateDiff;
  const groupedDiff: { [key: string]: any } = decodedDiff.reduce((groups, diff) => {
    const keys = diff.keys
      ? diff.keys.map(key => (key.address_info ? key.address_info.label : key.value))
      : null;

    const parsedDiff = {
      from: diff.from,
      to: diff.to,
      name: diff.name,
      field: diff.field,
      keys
    };

    groups[diff.address.label] = groups[diff.address.label]
      ? groups[diff.address.label].concat([parsedDiff])
      : [parsedDiff];
    return groups;
  }, {});

  return { hasBeenCast, executedOn, groupedDiff };
}
