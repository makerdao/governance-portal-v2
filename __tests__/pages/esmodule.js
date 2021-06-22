import React from 'react';
import { renderWithTheme } from '../helpers';
import { cleanup, fireEvent, waitFor, configure } from '@testing-library/react';
import waitForExpect from 'wait-for-expect';
import { TestAccountProvider } from '@makerdao/test-helpers';
import { cache } from 'swr';
import ESModule from '../../pages/esmodule';
import getMaker from '../../lib/maker';
import { accountsApi } from '../../stores/accounts';
import BigNumber from 'bignumber.js';

configure({
  getElementError: (message, container) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    error.stack = null;
    return error;
  }
});

export const WAD = new BigNumber('1e18');

let maker;

beforeAll(async () => {
  maker = await getMaker();
  expect(accountsApi.getState().currentAccount).toBeUndefined();

  const nextAccount = TestAccountProvider.nextAccount();
  await maker.service('accounts').addAccount('test-account', {
    type: 'privateKey',
    key: nextAccount.key
  });
  maker.useAccount('test-account');
  await waitForExpect(() => {
    const currentAccount = accountsApi.getState().currentAccount;
    expect(currentAccount.address).toBe(nextAccount.address);
    expect(currentAccount.name).toBe('test-account');
  });
});

afterEach(() => {
  cache.clear();
  cleanup();
});

describe('emergency shutdown render', () => {
  test('renders', async () => {
    const { debug } = renderWithTheme(<ESModule />);
  });

  // tests render on mobile view automatically
  test('show progress bar', () => {
    const { getByTestId } = renderWithTheme(<ESModule />);
    getByTestId('progress-ring');
  });

  test('show esm history', async () => {
    jest.setTimeout(10000);
    const { findByText } = renderWithTheme(<ESModule />);

    await findByText('ESM History');
    await findByText('Jun 20, 2021, 15:20 UTC', {}, { timeout: 5000 });
  });

  test('show "Burn your MKR" button', async () => {
    jest.setTimeout(10000);
    const { findByText } = renderWithTheme(<ESModule />);

    await findByText('Burn Your MKR', {}, { timeout: 5000 });
  });

  describe('MKR Modal Flow', () => {
    beforeEach(async() => {

      const token = maker.service('smartContract').getContract('MCD_GOV');
      const account = maker.currentAccount();
      await maker.service('accounts').useAccount('default');
      await token['mint(uint256)'](WAD.times(2).toFixed());
      await token['transfer(address,uint256)'](account.address, WAD.times(2).toFixed());
      await maker.service('accounts').useAccount('test-account');

      await waitForExpect(() => {
        const currentAccount = accountsApi.getState().currentAccount;
        expect(currentAccount.name).toBe('test-account');
      });
    });

    test('Burn MKR Modal Flow', async () => {
      jest.setTimeout(15000);
      
      const {
        getByTestId,
        getAllByTestId,
        getByText,
        getByRole,
        findByText,
        findByTestId,
        debug
      } = renderWithTheme(<ESModule />);
  
      // Intro Render
      // await wait(() =>
      //   getByText('The Emergency Shutdown Module (ESM) is responsible for', {
      //     exact: false
      //   })
      // );
      // click(getByText('Continue'));
  
      // First Step Render
      const burnButton = await findByText('Burn Your MKR', {}, { timeout: 5000 });
      fireEvent.click(burnButton);
      await findByText('Are you sure you want to burn MKR?');
      fireEvent.click(getByText('Continue'));
  
      // Second Step Render
      await findByText('Burn your MKR in the ESM');
  
      // Not Enough MKR Check
      const amount = 3;
      fireEvent.change(getByRole('spinbutton'), { target: { value: amount } });
      await findByText('MKR balance too low', {}, { timeout: 3000 });
  
      // await wait(() => getByText("You don't have enough MKR"));
      const input = getByRole('spinbutton');
      const continueButton = getByText('Continue');
      expect(continueButton.disabled).toBeTruthy();
  
      // Set Max Check
      await waitFor(() => fireEvent.click(getByText('Set max'), { timeout: 5000 }));
      await waitFor(() => expect(input.value).toEqual('2'), { timeout: 5000 });
  
      // MKR is Chief Check
      // getByTestId('voting-power');
  
      // Valid Amount Check
      fireEvent.change(input, { target: { value: amount - 2 } });
      await waitFor(() => expect(continueButton.disabled).toBeFalsy(), { timeout: 5000 });
      fireEvent.click(continueButton);
  
      // Third Step Render
      await findByText('Burn amount', {}, { timeout: 5000 });
      await findByText('New ESM total');
  
      let confirmInput = await findByTestId('confirm-input');
      let burnMKRbutton = await findByText('Continue');
      await waitFor(() => expect(burnMKRbutton.disabled).toBeTruthy());
  
      // click the terms of service
      let tos = await findByTestId('tosCheck');
      fireEvent.click(tos);
      await waitFor(() => expect(tos.checked).toBeTruthy());
  
      // click the unlock mkr
      const allowanceBtn = getByTestId('allowance-toggle');
      await waitFor(() => expect(!allowanceBtn.disabled).toBeTruthy());
      fireEvent.click(allowanceBtn);
      await waitFor(() => expect(allowanceBtn.disabled).toBeTruthy());
  
      // Incorrect Input Check
      fireEvent.change(confirmInput, { target: { value: 'I am burning 2.00 MKR' } });
      await waitFor(() => expect(burnMKRbutton.disabled).toBeTruthy());
  
      // Correct Input Check
      fireEvent.change(confirmInput, { target: { value: 'I am burning 1.00 MKR' } });
      await waitFor(() => expect(!burnMKRbutton.disabled).toBeTruthy(), { timeout: 5000 });
  
      fireEvent.click(burnMKRbutton);
  
      // Third Step Render
      await findByText('Sign Transaction');
  
      // Fourth Step Success Render
      await findByText('MKR successfully burned in ESM');
    });

  });
  
});

describe('initiate emergency shutdown', () => {
  beforeAll(async () => {
    maker = await getMaker();
    await maker.service('accounts').useAccount('default');
    const token = maker.service('smartContract').getContract('MCD_GOV');
    await token['mint(uint256)'](WAD.times(50000).toFixed());
    const esm = maker.service('smartContract').getContract('MCD_ESM');
    await token.approve(esm.address, -1); //approve unlimited
    await esm.join(WAD.times(50000).toFixed());
  });

  test('show Initiate Shutdown button on threshold reached', async () => {
    const { findByText } = await renderWithTheme(<ESModule />);
    await findByText('Initiate Emergency Shutdown');
  });

  test('show disabled Initiate Shutdown button on shutdown initiated', async () => {
    const esm = maker.service('smartContract').getContract('MCD_ESM');
    await esm.fire();
    const { findByText, getByTestId, debug } = await renderWithTheme(<ESModule />);
    const initiateButton = await findByText('Initiate Emergency Shutdown');
    waitFor(() => expect(initiateButton.disabled).toBeTruthy());
    // await wait(() => getByTestId('shutdown-initiated'));
  });
});
