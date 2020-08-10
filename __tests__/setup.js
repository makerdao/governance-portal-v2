import '@testing-library/jest-dom/extend-expect';
import { takeSnapshot, restoreSnapshot } from '@makerdao/test-helpers';

let snapshotData;
beforeAll(async () => {
  snapshotData = await takeSnapshot();
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
});

afterAll(() => {
  restoreSnapshot(snapshotData);
});
