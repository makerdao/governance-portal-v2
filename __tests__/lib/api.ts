import { getPolls } from '../../lib/api';
import fs from 'fs';

const cacheFile = `/tmp/gov-portal-testnet-polls-${new Date().toISOString().substring(0, 10)}`;

beforeAll(() => {
  process.env.USE_FS_CACHE = '1';
});

afterAll(() => {
  delete process.env.USE_FS_CACHE;
  if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile);
});

test('getPolls with filesystem caching', async () => {
  jest.setTimeout(15000);
  await getPolls();
  expect(fs.existsSync(cacheFile)).toBeTruthy();
});
