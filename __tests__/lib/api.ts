import { getPolls, parseExecutive } from '../../lib/api';
import fs from 'fs';
import { config } from '../../lib/config';

const cacheFile = `/tmp/gov-portal-testnet-polls-${new Date().toISOString().substring(0, 10)}`;

const Exec1 = 
`---
title: mock title
summary: mock summary
date: 2021-04-19T00:00:00.000Z
address: "0xDb0D1af4531F59E4E7EfA4ec0AcADec7518D42B6"
---
# mock markdown`;

const Exec2 = 
`---
title: mock title
summary: mock summary
date: invalid-date
address: "0xDb0D1af4531F59E4E7EfA4ec0AcADec7518D42B6"
---
# mock markdown`;

const Exec3 = 
`---
title: mock title
summary: mock summary
date: 2021-04-19T00:00:00.000Z
address: invalid-address
---
# mock markdown`;

beforeAll(() => {
  config.USE_FS_CACHE = '1';
});

afterAll(() => {
  config.USE_FS_CACHE = '';
  if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile);
});

test('getPolls with filesystem caching', async () => {
  jest.setTimeout(15000);
  await getPolls();
  expect(fs.existsSync(cacheFile)).toBeTruthy();
});

test('parseExecutive', async () => {
  const parsedExec = parseExecutive(Exec1, {'testnet': ['x']}, 'x');
  expect(!!parsedExec.about && !!parsedExec.content && !!parsedExec.title && !!parsedExec.proposalBlurb && !!parsedExec.key && !!parsedExec.address && !!parsedExec.date && !!parsedExec.active).toBe(true);
});

test('parseExecutive removes execs with invalid dates', async () => {
  const parsedExec = parseExecutive(Exec2, {'testnet': ['x']}, 'x');
  expect(parsedExec).toBe(null);
});

test('parseExecutive removes execs with invalid address', async () => {
  const parsedExec = parseExecutive(Exec3, {'testnet': ['x']}, 'x');
  expect(parsedExec).toBe(null);
});
