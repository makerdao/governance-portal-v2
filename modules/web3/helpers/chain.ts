import BigNumber from 'bignumber.js';
import { SupportedChainId } from '../constants/chainID';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';

export { getLibrary } from './getLibrary';
export * from './errors';

export const chainIdToNetworkName = (chainId: number): SupportedNetworks => {
  if (CHAIN_INFO[chainId]) return CHAIN_INFO[chainId].network;
  throw new Error(`Unsupported chain id ${chainId}`);
};

export const networkNameToChainId = (networkName: string): number => {
  const [key] = Object.entries(SupportedNetworks).find(([, v]) => v === networkName) || [];
  if (key && SupportedChainId[key]) return parseInt(SupportedChainId[key]);
  throw new Error(`Unsupported network name ${networkName}`);
};

export const paddedArray = (k, value) =>
  Array.from({ length: k })
    .map(() => 0)
    .concat(...value);

export const toBuffer = (number, opts) => {
  let hex = new BigNumber(number).toString(16);

  if (!opts) {
    opts = {};
  }

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

  return new BigNumber(hex.join(''), 16);
};
