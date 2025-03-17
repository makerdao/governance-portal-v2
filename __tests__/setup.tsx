import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { vi } from 'vitest';
import { mockIntersectionObserver } from '../__tests__/helpers';
import { config } from 'lib/config';

// Node/Jest don't have 'fetch' bc it's injected by next.js into global
// requiring next here applies the polyfills for fetch needed for some tests
// see: https://github.com/vercel/next.js/discussions/13678#discussioncomment-22383
require('next');

vi.mock('modules/web3/helpers/ens');

vi.mock('remark-gfm', () => () => null);
vi.mock('remark-html', () => () => null);
vi.mock('remark-parse', () => () => null);
vi.mock('remark-rehype', () => () => null);
vi.mock('unified', () => () => null);
vi.mock('rehype-stringify', () => () => null);
vi.mock('rehype-sanitize', () => () => null);

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
  if (typeof window !== 'undefined') {
    // https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });
  }
  global.IntersectionObserver = mockIntersectionObserver;

  config.REDIS_URL = '';
  config.USE_CACHE = 'false';
});
