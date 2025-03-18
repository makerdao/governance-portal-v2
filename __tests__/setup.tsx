import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { mockIntersectionObserver } from '../__tests__/helpers';
import { config } from 'lib/config';

// Node/Jest don't have 'fetch' bc it's injected by next.js into global
// requiring next here applies the polyfills for fetch needed for some tests
// see: https://github.com/vercel/next.js/discussions/13678#discussioncomment-22383
require('next');

jest.mock('modules/web3/helpers/ens');

jest.mock('remark-gfm', () => () => null);
jest.mock('remark-html', () => () => null);
jest.mock('remark-parse', () => () => null);
jest.mock('remark-rehype', () => () => null);
jest.mock('unified', () => () => null);
jest.mock('rehype-stringify', () => () => null);
jest.mock('rehype-sanitize', () => () => null);

jest.mock('uuid', () => {
  return {
    v4: () => Math.round(Math.random() * 10000).toString()
  };
});

jest.mock('modules/address/components/AddressIcon', () => {
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
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    });
  }
  global.IntersectionObserver = mockIntersectionObserver;

  config.REDIS_URL = '';
  config.USE_CACHE = 'false';
});
