/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { cloneElement } from 'react';
import { jsx } from 'theme-ui';
import { css, ThemeUIStyleObject } from '@theme-ui/css';

import round from 'lodash/round';
import logger from './logger';
import { pad, trim } from 'viem';

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
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function backoffRetry(
  retries: number,
  fn: () => Promise<any>,
  delay = 500,
  logFn: any = () => null
): Promise<any> {
  return fn().catch(err => {
    logFn(`backOffRetry: ${retries}`);
    return retries > 1
      ? wait(delay).then(() => backoffRetry(retries - 1, fn, delay * 2, logFn))
      : Promise.reject(err);
  });
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

export function formatAddress(address: string): string {
  return address.slice(0, 7) + '...' + address.slice(-4);
}

export const sortBytesArray = (_array: string[]) =>
  [..._array].sort((a, b) => {
    return BigInt(a.toLowerCase()) > BigInt(b.toLowerCase()) ? 1 : -1;
  });

export const formatRound = (num, decimals = 2) =>
  isNaN(num) ? '----' : round(num, decimals).toLocaleString(undefined, { minimumFractionDigits: decimals });

export const paddedArray = (k, value) =>
  Array.from({ length: k })
    .map(() => 0)
    .concat(...value);

export const toBuffer = (number: string, opts) => {
  let hex = BigInt(number).toString(16);

  const endian = { 1: 'big', '-1': 'little' }[opts.endian] || opts.endian || 'big';

  if (hex.charAt(0) === '-') {
    throw new Error('Converting negative numbers to Buffers not supported yet');
  }

  const size = opts.size === 'auto' ? Math.ceil(hex.length / 2) : opts.size || 1;

  const len = Math.ceil(hex.length / (2 * size)) * size;
  const buf = Buffer.alloc(len);

  // Zero-pad the hex string so the chunks are all `size` long
  while (hex.length < 2 * len) {
    hex = `0${hex}`;
  }

  const hx = hex.split(new RegExp(`(.{${2 * size}})`)).filter(s => s.length > 0);

  hx.forEach((chunk, i) => {
    for (let j = 0; j < size; j++) {
      const ix = i * size + (endian === 'big' ? j : size - j - 1);
      buf[ix] = parseInt(chunk.slice(j * 2, j * 2 + 2), 16);
    }
  });

  return buf;
};

export const fromBuffer = (buf, opts) => {
  if (!opts) {
    opts = {};
  }

  const endian = { 1: 'big', '-1': 'little' }[opts.endian] || opts.endian || 'big';

  const size = opts.size === 'auto' ? Math.ceil(buf.length) : opts.size || 1;

  if (buf.length % size !== 0) {
    throw new RangeError(`Buffer length (${buf.length}) must be a multiple of size (${size})`);
  }

  const hex: any[] = [];
  for (let i = 0; i < buf.length; i += size) {
    const chunk: any[] = [];
    for (let j = 0; j < size; j++) {
      chunk.push(buf[i + (endian === 'big' ? j : size - j - 1)]);
    }

    hex.push(chunk.map(c => (c < 16 ? '0' : '') + c.toString(16)).join(''));
  }
  return BigInt('0x' + hex.join(''));
};

export const paddedBytes32ToAddress = (hex: string): string =>
  hex.length > 42 ? pad(trim(hex as `0x${string}`), { size: 20 }) : hex;

export const objectToGetParams = (object: { [key: string]: string | number | undefined | null }): string => {
  const params = Object.entries(object)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return params.length > 0 ? `?${params.join('&')}` : '';
};

const windowOpen = (
  url: string,
  { height, width, ...configRest }: { height: number; width: number; [key: string]: any },
  onClose?: (dialog: Window | null) => void
) => {
  const config: { [key: string]: string | number } = {
    height,
    width,
    location: 'no',
    toolbar: 'no',
    status: 'no',
    directories: 'no',
    menubar: 'no',
    scrollbars: 'yes',
    resizable: 'no',
    centerscreen: 'yes',
    chrome: 'yes',
    ...configRest
  };

  const shareDialog = window.open(
    url,
    '',
    Object.keys(config)
      .map(key => `${key}=${config[key]}`)
      .join(', ')
  );

  if (onClose) {
    const interval = window.setInterval(() => {
      try {
        if (shareDialog === null || shareDialog.closed) {
          window.clearInterval(interval);
          onClose(shareDialog);
        }
      } catch (e) {
        logger.error('windowOpen:', e);
      }
    }, 1000);
  }

  return shareDialog;
};

const getBoxPositionOnWindowCenter = (width: number, height: number) => ({
  left: window.outerWidth / 2 + (window.screenX || window.screenLeft || 0) - width / 2,
  top: window.outerHeight / 2 + (window.screenY || window.screenTop || 0) - height / 2
});

export function openWindowWithUrl(url: string): void {
  const windowConfig = {
    height: 400,
    width: 550,
    ...getBoxPositionOnWindowCenter(550, 400)
  };

  windowOpen(url, windowConfig);
}

export function isExponential(numberToCheck: number): boolean {
  return numberToCheck.toString().includes('e');
}

export function calculatePercentage(value: bigint, total: bigint, decimals = 0): number {
  const percentage = (value * 100n * BigInt(10 ** decimals)) / total;
  return Number(percentage) / 10 ** decimals;
}
