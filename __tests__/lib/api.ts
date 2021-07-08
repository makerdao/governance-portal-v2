import { getPolls } from '../../lib/api';
import fs from 'fs';
import { config } from '../../lib/config';

const cacheFile = `/tmp/gov-portal-testnet-polls-${new Date().toISOString().substring(0, 10)}`;

describe('API', () => {
  beforeAll(() => {
    config.USE_FS_CACHE = '1';
  });
  
  afterAll(() => {
    config.USE_FS_CACHE = '';
    if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile);
  });
  
  test('getPolls with filesystem caching', async () => {
    jest.setTimeout(25000);
    await getPolls();
    expect(fs.existsSync(cacheFile)).toBeTruthy();
  });
  
});