/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/* eslint @typescript-eslint/no-var-requires: "off" */
import waitForExpect from 'wait-for-expect';

import { TX_NOT_ENOUGH_FUNDS } from '../../helpers/errors';
import { Mock, vi } from 'vitest';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';

waitForExpect.defaults.interval = 1;

vi.mock('modules/web3/helpers/getPublicClient');

let transactionsApi, transactionsSelectors;
describe('Transactions', () => {
  beforeAll(async () => {
    vi.setConfig({ testTimeout: 30000 });
  });

  beforeEach(async () => {
    (getPublicClient as Mock).mockReturnValue({
      waitForTransactionReceipt: vi.fn().mockImplementation(() => Promise.resolve())
    });
    vi.resetModules();
    ({ transactionsApi, transactionsSelectors } = await import('../transactions'));
  });

  test('should call initTx, setPending, and setMined for successful transactions', async () => {
    const address = '0x000000';

    const initTxMock = (transactionsApi.getState().initTx = vi.fn(transactionsApi.getState().initTx));

    const setPendingMock = (transactionsApi.getState().setPending = vi.fn(
      transactionsApi.getState().setPending
    ));

    const setMinedMock = (transactionsApi.getState().setMined = vi.fn(transactionsApi.getState().setMined));

    const txCreator = () => {
      return Promise.resolve({
        chainId: 1,
        hash: 'test'
      });
    };

    await transactionsApi.getState().track(txCreator, address);

    await waitForExpect(() => {
      expect(initTxMock.mock.calls.length).toBe(1);
      expect(setPendingMock.mock.calls.length).toBe(1);
      expect(setMinedMock.mock.calls.length).toBe(1);
    });
  });

  test('Should initialize a transaction', () => {
    transactionsApi.getState().initTx('test', 'test', 'test');
    expect(transactionsSelectors.getTransaction(transactionsApi.getState(), 'test').status).toBe(
      'initialized'
    );

    expect(
      transactionsSelectors.getTransaction(transactionsApi.getState(), 'test').submittedAt
    ).toBeDefined();
    expect(transactionsSelectors.getTransaction(transactionsApi.getState(), 'test').from).toBe('test');
  });

  test('should set pending properly', async () => {
    const address = '0x000000';
    const txCreator = () => {
      return Promise.resolve({
        chainId: 1,
        hash: 'test'
      });
    };
    const mockPendingHook = vi.fn();
    await transactionsApi.getState().track(txCreator, address, '', { pending: mockPendingHook });
    await waitForExpect(() => expect(mockPendingHook.mock.calls.length).toBe(1));
  });

  test('should set mined properly', async () => {
    const address = '0x000000';
    const txCreator = () => {
      return Promise.resolve({
        chainId: 1,
        hash: 'test'
      });
    };

    const txId = await transactionsApi.getState().track(txCreator, address);

    await waitForExpect(() => {
      expect(transactionsSelectors.getTransaction(transactionsApi.getState(), txId).status).toBe('mined');
    });
  });

  test('should set error properly', async () => {
    const address = '0x000000';
    const txCreator = () => {
      return Promise.reject({
        message: TX_NOT_ENOUGH_FUNDS
      });
    };
    const txId = await transactionsApi.getState().track(txCreator, address);

    await waitForExpect(() => {
      const txState = transactionsSelectors.getTransaction(transactionsApi.getState(), txId);
      expect(txState.status).toBe('error');
      expect(txState.error).toBe(TX_NOT_ENOUGH_FUNDS);
      expect(txState.errorType).toBe('not sent');
    });
  });

  test('should track multiple txs', async () => {
    const address = '0x000000';

    const txCreator1 = () => {
      return Promise.resolve({
        chainId: 1,
        hash: 'test'
      });
    };
    const txCreator2 = () => {
      return Promise.resolve({
        chainId: 1,
        hash: 'test2'
      });
    };

    await transactionsApi.getState().track(txCreator1, address);
    await transactionsApi.getState().track(txCreator2, address);

    await waitForExpect(() => {
      expect(transactionsApi.getState().transactions.length).toBe(2);
    });
  });
});
