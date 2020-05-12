import '@testing-library/jest-dom/extend-expect';
import { takeSnapshot, restoreSnapshot } from '@makerdao/test-helpers';

let snapshotData;

beforeAll(async () => {
  snapshotData = await takeSnapshot();
  jest.setTimeout(10000);
});

afterAll(() => {
  restoreSnapshot(snapshotData);
});
