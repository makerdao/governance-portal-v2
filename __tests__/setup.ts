import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { mockIntersectionObserver } from '../__tests__/helpers';
import { getENS } from 'modules/web3/helpers/ens';
jest.mock('modules/web3/helpers/ens');

beforeAll(async () => {
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
  global.IntersectionObserver = mockIntersectionObserver;
  
  // Mock ens calls
  (getENS as jest.Mock).mockReturnValue('');
});

