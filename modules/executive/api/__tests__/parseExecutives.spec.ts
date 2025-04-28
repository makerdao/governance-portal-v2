/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { parseExecutive } from '../parseExecutive';
import { config } from '../../../../lib/config';
import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import { SupportedNetworks } from 'modules/web3/constants/networks';

const Exec1 = {
  path: '',
  metadata: {
    title: 'mock title',
    summary: 'mock summary',
    date: '2021-04-19T00:00:00.000Z',
    address: '0xDb0D1af4531F59E4E7EfA4ec0AcADec7518D42B6'
  }
};

const Exec2 = {
  path: '',
  metadata: {
    title: 'mock title',
    summary: 'mock summary',
    date: 'invalid-date',
    address: '0xDb0D1af4531F59E4E7EfA4ec0AcADec7518D42B6'
  }
};

const Exec3 = {
  path: '',
  metadata: {
    title: 'mock title',
    summary: 'mock summary',
    date: '2021-04-19T00:00:00.000Z',
    address: 'invalid address'
  }
};

describe('Parse executive', () => {
  beforeAll(() => {
    config.USE_CACHE = 'true';
  });

  afterAll(() => {
    config.USE_CACHE = '';
  });

  test('parseExecutive', async () => {
    const parsedExec = parseExecutive(Exec1, { tenderly: ['x'] }, 'x', SupportedNetworks.TENDERLY);
    expect(
      !!parsedExec?.title &&
        !!parsedExec?.proposalBlurb &&
        !!parsedExec?.key &&
        !!parsedExec?.address &&
        !!parsedExec?.date &&
        !!parsedExec?.active
    ).toBe(true);
  });

  test('parseExecutive removes execs with invalid dates', async () => {
    const parsedExec = parseExecutive(Exec2, { tenderly: ['x'] }, 'x', SupportedNetworks.TENDERLY);
    expect(parsedExec).toBe(null);
  });

  test('parseExecutive removes execs with invalid address', async () => {
    const parsedExec = parseExecutive(Exec3, { tenderly: ['x'] }, 'x', SupportedNetworks.TENDERLY);
    expect(parsedExec).toBe(null);
  });
});

test('parseExecutive', async () => {
  const parsedExec = parseExecutive(Exec1, { tenderly: ['x'] }, 'x', SupportedNetworks.TENDERLY);
  expect(
    !!parsedExec?.title &&
      !!parsedExec?.proposalBlurb &&
      !!parsedExec?.key &&
      !!parsedExec?.address &&
      !!parsedExec?.date &&
      !!parsedExec?.active
  ).toBe(true);
});

test('parseExecutive removes execs with invalid dates', async () => {
  const parsedExec = parseExecutive(Exec2, { tenderly: ['x'] }, 'x', SupportedNetworks.TENDERLY);
  expect(parsedExec).toBe(null);
});

test('parseExecutive removes execs with invalid address', async () => {
  const parsedExec = parseExecutive(Exec3, { tenderly: ['x'] }, 'x', SupportedNetworks.TENDERLY);
  expect(parsedExec).toBe(null);
});
