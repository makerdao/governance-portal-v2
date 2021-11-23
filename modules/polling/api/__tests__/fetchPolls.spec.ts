import { getPolls } from '../fetchPolls';
import fs from 'fs';
import { config } from '../../../../lib/config';
import os from 'os';

const cacheFile = `/${os.tmpdir()}/gov-portal-testnet-polls-${new Date().toISOString().substring(0, 10)}`;

describe('Fetch poll', () => {
  beforeAll(() => {
    config.USE_FS_CACHE = '1';
  });

  afterAll(() => {
    config.USE_FS_CACHE = '';
    if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile);
  });

  test('getPolls with filesystem caching', async () => {
    jest.setTimeout(25000);
    await getPolls({});
    expect(fs.existsSync(cacheFile)).toBeTruthy();
  });
});
