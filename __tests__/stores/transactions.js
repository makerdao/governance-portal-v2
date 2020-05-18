import { TestAccountProvider } from '@makerdao/test-helpers';
import waitForExpect from 'wait-for-expect';

import { TX_NOT_ENOUGH_FUNDS } from '../../lib/errors';

waitForExpect.defaults.interval = 1;

let maker, transactionsApi, ETH;
beforeEach(async () => {
  jest.resetModules();
  maker = await require('../../lib/maker').default();
  ({ ETH } = require('../../lib/maker'));
  ({ transactionsApi } = require('../../stores/transactions'));
});

test('should call initTx, setPending, and setMined for successful transactions', async () => {
  const initTxMock = (transactionsApi.getState().initTx = jest.fn(
    transactionsApi.getState().initTx
  ));

  const setPendingMock = (transactionsApi.getState().setPending = jest.fn(
    transactionsApi.getState().setPending
  ));

  const setMinedMock = (transactionsApi.getState().setMined = jest.fn(
    transactionsApi.getState().setMined
  ));

  const tx = maker
    .getToken(ETH)
    .transfer(TestAccountProvider.nextAccount().address, ETH(0.1));

  transactionsApi.getState().track(tx);

  await waitForExpect(() => {
    expect(initTxMock.mock.calls.length).toBe(1);
    expect(setPendingMock.mock.calls.length).toBe(1);
    expect(setMinedMock.mock.calls.length).toBe(1);
  });
});

test('should initialize a tx properly', async () => {
  const tx = maker
    .getToken(ETH)
    .transfer(TestAccountProvider.nextAccount().address, ETH(0.1));
  const currentAddress = maker.currentAddress();

  const message = 'sending ETH';
  transactionsApi.getState().track(tx, message);

  await waitForExpect(() => {
    expect(
      transactionsApi.getState().transactions[currentAddress][0].status
    ).toBe('initialized');
    expect(
      transactionsApi.getState().transactions[currentAddress][0].message
    ).toBe(message);
  });

  expect((await tx)._timeStampSubmitted).toBe(
    transactionsApi.getState().transactions[currentAddress][0].submittedAt
  );
  expect(
    transactionsApi.getState().transactions[currentAddress][0].submittedAt
  ).toBeDefined();
});

test('should set pending properly', async () => {
  const tx = maker
    .getToken(ETH)
    .transfer(TestAccountProvider.nextAccount().address, ETH(0.1));
  const currentAddress = maker.currentAddress();

  transactionsApi.getState().track(tx);

  await waitForExpect(() => {
    expect(
      transactionsApi.getState().transactions[currentAddress][0].status
    ).toBe('pending');
  });

  expect((await tx).hash).toBe(
    transactionsApi.getState().transactions[currentAddress][0].hash
  );
  expect(
    transactionsApi.getState().transactions[currentAddress][0].hash
  ).toBeDefined();
});

test('should set mined properly', async () => {
  const tx = maker
    .getToken(ETH)
    .transfer(TestAccountProvider.nextAccount().address, ETH(0.1));
  const currentAddress = maker.currentAddress();

  transactionsApi.getState().track(tx);

  await waitForExpect(() => {
    expect(
      transactionsApi.getState().transactions[currentAddress][0].status
    ).toBe('mined');
  });
});

test('should set error properly', async () => {
  const tx = maker
    .getToken(ETH)
    .transfer(TestAccountProvider.nextAccount().address, ETH(10e18));
  const currentAddress = maker.currentAddress();

  transactionsApi.getState().track(tx);

  await waitForExpect(() => {
    const txState = transactionsApi.getState().transactions[currentAddress][0];
    expect(txState.status).toBe('error');
    expect(txState.error).toBe(TX_NOT_ENOUGH_FUNDS);
    expect(txState.errorType).toBe('not sent');
  });
});

test('should track multiple txs', async () => {
  const currentAddress = maker.currentAddress();
  const tx1 = maker
    .getToken(ETH)
    .transfer(TestAccountProvider.nextAccount().address, ETH(10e18));

  const tx2 = maker
    .getToken(ETH)
    .transfer(TestAccountProvider.nextAccount().address, ETH(10e18));

  transactionsApi.getState().track(tx1);
  transactionsApi.getState().track(tx2);

  await waitForExpect(() => {
    expect(transactionsApi.getState().transactions[currentAddress].length).toBe(
      2
    );
  });
});
