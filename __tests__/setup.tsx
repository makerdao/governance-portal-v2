import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { mockIntersectionObserver } from '../__tests__/helpers';
import { getENS } from 'modules/web3/helpers/ens';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';

jest.mock('@web3-react/core');
jest.mock('modules/web3/helpers/ens');

jest.mock('remark-gfm', () => () => null);
jest.mock('remark-html', () => () => null);
jest.mock('remark', () => () => null);

jest.mock('modules/address/components/AddressIcon', () => {
  return {
    __esModule: true,
    A: true,
    default: () => {
      return <div />;
    }
  };
});

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

beforeAll(async () => {
  (useWeb3React as jest.Mock).mockReturnValue({
    account: '',
    activate: () => null
  });

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
