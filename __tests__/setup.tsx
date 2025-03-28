import { beforeAll, vi } from 'vitest';
import { mockIntersectionObserver } from '../__tests__/helpers';
import { config } from 'lib/config';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Node/Jest don't have 'fetch' bc it's injected by next.js into global
// requiring next here applies the polyfills for fetch needed for some tests
// see: https://github.com/vercel/next.js/discussions/13678#discussioncomment-22383
require('next');

vi.mock('modules/web3/helpers/ens');

vi.mock('remark-gfm', () => ({
  default: () => null
}));
vi.mock('remark-html', () => ({
  default: () => null
}));
vi.mock('remark-parse', () => ({
  default: () => null
}));
vi.mock('remark-rehype', () => ({
  default: () => null
}));
vi.mock('unified', () => ({
  default: () => null
}));
vi.mock('rehype-stringify', () => ({
  default: () => null
}));
vi.mock('rehype-sanitize', () => ({
  default: () => null
}));

vi.mock('uuid', () => {
  return {
    v4: () => Math.round(Math.random() * 10000).toString()
  };
});

vi.mock('modules/address/components/AddressIcon', () => {
  return {
    __esModule: true,
    A: true,
    default: () => {
      return <div />;
    }
  };
});

beforeAll(async () => {
  global.IntersectionObserver = mockIntersectionObserver;

  config.REDIS_URL = '';
  config.USE_CACHE = 'false';
});
