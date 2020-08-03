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
  const initTxMock = (transactionsApi.getState().initTx = jest.fn(transactionsApi.getState().initTx));

  const setPendingMock = (transactionsApi.getState().setPending = jest.fn(
    transactionsApi.getState().setPending
  ));

  const setMinedMock = (transactionsApi.getState().setMined = jest.fn(transactionsApi.getState().setMined));

  const txCreator = () => maker.getToken(ETH).transfer(TestAccountProvider.nextAccount().address, ETH(0.1));
  await transactionsApi.getState().track(txCreator);

  await waitForExpect(() => {
    expect(initTxMock.mock.calls.length).toBe(1);
    expect(setPendingMock.mock.calls.length).toBe(1);
    expect(setMinedMock.mock.calls.length).toBe(1);
  });
});

test('should initialize a tx properly', async () => {
  const txCreator = () => maker.getToken(ETH).transfer(TestAccountProvider.nextAccount().address, ETH(0.1));
  const currentAddress = maker.currentAddress();

  const message = 'sending ETH';
  const txId = await transactionsApi.getState().track(txCreator, message);

  await waitForExpect(() => {
    expect(transactionsApi.getState().getTransaction(txId).status).toBe('initialized');
    expect(transactionsApi.getState().getTransaction(txId).message).toBe(message);
  });

  expect(transactionsApi.getState().getTransaction(txId).submittedAt).toBeDefined();
  expect(transactionsApi.getState().getTransaction(txId).from).toBe(currentAddress);
});

test('should set pending properly', async () => {
  const txCreator = () => maker.getToken(ETH).transfer(TestAccountProvider.nextAccount().address, ETH(0.1));
  const txId = await transactionsApi.getState().track(txCreator);

  await waitForExpect(() => {
    expect(transactionsApi.getState().getTransaction(txId).status).toBe('pending');
  });

  expect(transactionsApi.getState().getTransaction(txId).hash).toBeDefined();
});

test('should set mined properly', async () => {
  const txCreator = () => maker.getToken(ETH).transfer(TestAccountProvider.nextAccount().address, ETH(0.1));
  const txId = await transactionsApi.getState().track(txCreator);

  await waitForExpect(() => {
    expect(transactionsApi.getState().getTransaction(txId).status).toBe('mined');
  });
});

test('should set error properly', async () => {
  const txCreator = () => maker.getToken(ETH).transfer(TestAccountProvider.nextAccount().address, ETH(10e18));
  const txId = await transactionsApi.getState().track(txCreator);

  await waitForExpect(() => {
    const txState = transactionsApi.getState().getTransaction(txId);
    expect(txState.status).toBe('error');
    expect(txState.error).toBe(TX_NOT_ENOUGH_FUNDS);
    expect(txState.errorType).toBe('not sent');
  });
});

test('should track multiple txs', async () => {
  const txCreator1 = () =>
    maker.getToken(ETH).transfer(TestAccountProvider.nextAccount().address, ETH(10e18));
  const txCreator2 = () =>
    maker.getToken(ETH).transfer(TestAccountProvider.nextAccount().address, ETH(10e18));

  await transactionsApi.getState().track(txCreator1);
  await transactionsApi.getState().track(txCreator2);

  await waitForExpect(() => {
    expect(transactionsApi.getState().transactions.length).toBe(2);
  });
});
