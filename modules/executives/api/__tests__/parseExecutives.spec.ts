import { parseExecutive } from '../parseExecutive';
import { config } from '../../../../lib/config';

const Exec1 = `---
title: mock title
summary: mock summary
date: 2021-04-19T00:00:00.000Z
address: "0xDb0D1af4531F59E4E7EfA4ec0AcADec7518D42B6"
---
# mock markdown
`;

const Exec2 = `---
title: mock title
summary: mock summary
date: invalid-date
address: "0xDb0D1af4531F59E4E7EfA4ec0AcADec7518D42B6"
---
# mock markdown
`;

const Exec3 = `---
title: mock title
summary: mock summary
date: 2021-04-19T00:00:00.000Z
address: invalid-address
---
# mock markdown
`;

describe('Parse executive', () => {
  beforeAll(() => {
    config.USE_FS_CACHE = '1';
  });

  afterAll(() => {
    config.USE_FS_CACHE = '';
  });

  test('parseExecutive', async () => {
    const parsedExec = parseExecutive(Exec1, { testnet: ['x'] }, 'x');
    expect(
      !!parsedExec.about &&
        !!parsedExec.content &&
        !!parsedExec.title &&
        !!parsedExec.proposalBlurb &&
        !!parsedExec.key &&
        !!parsedExec.address &&
        !!parsedExec.date &&
        !!parsedExec.active
    ).toBe(true);
  });

  test('parseExecutive removes execs with invalid dates', async () => {
    const parsedExec = parseExecutive(Exec2, { testnet: ['x'] }, 'x');
    expect(parsedExec).toBe(null);
  });

  test('parseExecutive removes execs with invalid address', async () => {
    const parsedExec = parseExecutive(Exec3, { testnet: ['x'] }, 'x');
    expect(parsedExec).toBe(null);
  });
});

test('parseExecutive', async () => {
  const parsedExec = parseExecutive(Exec1, { testnet: ['x'] }, 'x');
  expect(
    !!parsedExec.about &&
      !!parsedExec.content &&
      !!parsedExec.title &&
      !!parsedExec.proposalBlurb &&
      !!parsedExec.key &&
      !!parsedExec.address &&
      !!parsedExec.date &&
      !!parsedExec.active
  ).toBe(true);
});

test('parseExecutive removes execs with invalid dates', async () => {
  const parsedExec = parseExecutive(Exec2, { testnet: ['x'] }, 'x');
  expect(parsedExec).toBe(null);
});

test('parseExecutive removes execs with invalid address', async () => {
  const parsedExec = parseExecutive(Exec3, { testnet: ['x'] }, 'x');
  expect(parsedExec).toBe(null);
});
