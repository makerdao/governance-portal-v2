import remark from 'remark';
import html from 'remark-html';
import invariant from 'tiny-invariant';
import { cloneElement } from 'react';
import { jsx } from 'theme-ui';
import { css, ThemeUIStyleObject } from '@theme-ui/css';
import BigNumber from 'bignumber.js';
import { MKR } from './maker';
import { CurrencyObject } from 'types/currency';
import { PollTally } from 'types/pollTally';
import { Poll } from 'types/poll';
import { SpellStateDiff } from 'types/spellStateDiff';
import { SupportedNetworks, ETHERSCAN_PREFIXES } from './constants';
import getMaker from './maker';
import mockPolls from '../mocks/polls.json';
import { PollVote } from 'types/pollVote';
import round from 'lodash/round';

export function bigNumberKFormat(num: CurrencyObject): string {
  invariant(num && num.symbol && num.toBigNumber, 'bigNumberKFormat must recieve a maker currency object');
  const units = ['K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];
  let typeIndex = Math.floor(num.div(10).toFixed(0).length / 3) - 1;
  typeIndex = typeIndex >= units.length ? 7 : typeIndex; // if the number out of range
  const noUnit = typeIndex < 0; // if the number is smaller than 1,000
  const value = noUnit ? num : num.div(Math.pow(1000, typeIndex + 1));
  invariant(value, 'bigNumberKFormat value undefined');
  return `${value.toBigNumber().toFixed(2)}${noUnit ? '' : units[typeIndex]}`;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString().replace(/<a href/g, '<a target="_blank" href');
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

export function wait(duration: number): Promise<void> {
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
        firstChoice: new BigNumber(rawTally.options?.[key]?.firstChoice || 0),
        transfer: new BigNumber(rawTally.options?.[key]?.transfer || 0),
        firstPct: rawTally.options?.[key]?.firstChoice
          ? new BigNumber(rawTally.options[key].firstChoice)
              .div(totalMkrParticipation.toBigNumber())
              .times(100)
          : new BigNumber(0),
        transferPct: rawTally.options?.[key]?.transfer
          ? new BigNumber(rawTally.options[key].transfer).div(totalMkrParticipation.toBigNumber()).times(100)
          : new BigNumber(0),
        eliminated: rawTally.options?.[key]?.eliminated ?? true,
        winner: rawTally.options?.[key]?.winner ?? false
      };
    })
    .sort((a, b) => {
      const valueA = a.firstChoice.plus(a.transfer);
      const valueB = b.firstChoice.plus(b.transfer);
      if (valueA.eq(valueB)) return a.optionName > b.optionName ? 1 : -1;
      return valueA.gt(valueB) ? -1 : 1;
    });

  return { ...rawTally, results, totalMkrParticipation, numVoters: rawTally.numVoters };
}

export function getEtherscanLink(
  network: SupportedNetworks,
  data: string,
  type: 'transaction' | 'address'
): string {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[network] || ETHERSCAN_PREFIXES[SupportedNetworks.MAINNET]
  }etherscan.io`;

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

export function isRankedChoicePoll(poll: Poll): boolean {
  return poll.voteType === 'Ranked Choice IRV';
}

export function extractCurrentPollVote(
  poll: Poll,
  allUserVotes: PollVote[] | undefined
): number[] | number | null {
  const currentVote = allUserVotes?.find(_poll => _poll.pollId === poll.pollId);

  if (poll.voteType === 'Ranked Choice IRV') {
    return currentVote?.rankedChoiceOption !== undefined ? currentVote.rankedChoiceOption : null;
  } else if (poll.voteType === 'Plurality Voting') {
    return currentVote?.option !== undefined ? currentVote.option : null;
  }

  return null;
}

export function findPollById(pollList: Poll[], pollId: string): Poll | undefined {
  return pollList.find((poll: Poll) => parseInt(pollId) === poll.pollId);
}

export async function fetchJson(url: RequestInfo, init?: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  const json = await response.json();

  if (!response.ok) throw new Error(`${response.statusText}: ${json.error?.message || JSON.stringify(json)}`);
  return json;
}

/* eslint-disable no-useless-escape */
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
/* eslint-enable no-useless-escape */

// https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
export function getNumberWithOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Add sx styles to the passed in component. Provided styles override component styles if there's a clash. */
export function styledClone(component, { sx: stylesToMerge }: { sx: ThemeUIStyleObject }): React.ReactNode {
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

export const formatDateWithTime = (dateString: Date | undefined | number | string ): string => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    timeZone: 'UTC',
    timeZoneName: 'short'
  } as const;

  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (err) {
    console.error(err);
    return '??';
  }
};

export async function initTestchainPolls() {
  const maker = await getMaker();
  const pollingService = maker.service('govPolling');
  const hash = 'dummy hash';

  // This detects whether the mock polls have been deployed yet
  const testTx = await pollingService.createPoll(now(), now() + 500000, hash, hash);
  if (testTx !== 0) return;

  console.log('setting up some polls on the testchain...');
  return mockPolls.map(async poll => {
    const id = await pollingService.createPoll(now(), now() + 50000, hash, poll.url);
    console.log(`created poll #${id}`);
  });
}

function now() {
  return Math.floor(new Date().getTime());
}

export function formatAddress(address: string): string {
  return address.slice(0, 7) + '...' + address.slice(-4);
}

export function cutMiddle(text = '', left = 6, right = 4): string {
  if (text.length <= left + right) return text;
  return `${text.substring(0, left)}...${text.substring(text.length - right - 1, text.length - 1)}`;
}

/**
 * sets the value of an input in a way that triggers the onChange handler.
 * this is a workaround for logic in React that dedupes change events.
 * see: https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04
 */
export function changeInputValue(inputRef: HTMLInputElement, value: string): void {
  const valueProp = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  invariant(valueProp?.set);
  valueProp.set.call(inputRef, value);
  inputRef.dispatchEvent(new Event('input', { bubbles: true }));
}

export const sortBytesArray = _array =>
  [..._array].sort((a, b) => {
    return new BigNumber(a.toLowerCase()).gt(new BigNumber(b.toLowerCase())) ? 1 : -1;
  });

export const formatRound = (num, decimals = 2) =>
  isNaN(num) ? '----' : round(num, decimals).toLocaleString({}, { minimumFractionDigits: decimals });
