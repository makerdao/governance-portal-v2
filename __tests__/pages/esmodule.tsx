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
describe('ES Module', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    maker = await getMaker();
    accountsApi.getState().addAccountsListener(maker);

    
    expect(accountsApi.getState().currentAccount).toBeUndefined();

    const nextAccount = TestAccountProvider.nextAccount();
    await maker.service('accounts').addAccount('test-account', {
      type: 'privateKey',
      key: nextAccount.key
    });

    maker.useAccount('test-account');
    await waitForExpect(() => {
      const currentAccount = accountsApi.getState().currentAccount;
      expect(currentAccount?.address).toBe(nextAccount.address);
      expect(currentAccount?.name).toBe('test-account');
    }, 30000);
  });

  afterEach(() => {
    cache.clear();
    cleanup();
  });

  describe('emergency shutdown render', () => {
    // tests render on mobile view automatically
    test('show progress bar', () => {
      const { getByTestId } = renderWithTheme(<ESModule />);
      const progressBar = getByTestId('progress-ring');
      expect(progressBar).toBeTruthy();
    });

    test('show esm history', async () => {
      const { findByText } = renderWithTheme(<ESModule />);

      const title = await findByText('ESM History');
      const date = await findByText('Jun 20, 2021, 15:20 UTC', {}, { timeout: 5000 });
      expect(title).toBeTruthy();
      expect(date).toBeTruthy();
    });

    test('show "Burn your MKR" button', async () => {
      const { findByText } = renderWithTheme(<ESModule />);

      const buttonBurn = await findByText('Burn Your MKR', {}, { timeout: 15000 });
      expect(buttonBurn).toBeDefined();
      // Initiate Emergency Shutdow
    });

    describe('MKR Modal Flow', () => {
      beforeEach(async () => {
        const token = maker.service('smartContract').getContract('MCD_GOV');
        const account = maker.currentAccount();
        await maker.service('accounts').useAccount('default');
        await token['mint(uint256)'](WAD.times(2).toFixed());
        await token['transfer(address,uint256)'](account.address, WAD.times(2).toFixed());
        await maker.service('accounts').useAccount('test-account');

        await waitForExpect(() => {
          const currentAccount = accountsApi.getState().currentAccount;
          expect(currentAccount?.name).toBe('test-account');
        }, 10000);
      });

      test('Burn MKR Modal Flow', async () => {
        const { getByTestId, getByText, findByText, findByTestId } = renderWithTheme(<ESModule />);

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
        await findByText('Enter the amount of MKR to burn');

        // Not Enough MKR Check
        const amount = 35;
        fireEvent.change(getByTestId('mkr-input'), { target: { value: amount } });
        const tooLow = await findByText('MKR balance too low', {}, { timeout: 3000 });
        expect(tooLow).toBeTruthy();

        // Wait until user balance is loaded
        await findByTestId('mkr-input-balance');

        // await wait(() => getByText("You don't have enough MKR"));
        const input = getByTestId('mkr-input');
        const continueButton = getByText('Continue');

        expect(continueButton.disabled).toBeTruthy();

        // Set Max Check
        const setMaxButton = await getByTestId('mkr-input-set-max');
        // Click on the button
        fireEvent.click(setMaxButton);
        expect(input).toHaveValue(2.0);

        // MKR is Chief Check
        // getByTestId('voting-power');

        // Valid Amount Check
        fireEvent.change(input, { target: { value: 1 } });
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
        const signTransaction = await findByText('Sign Transaction');
        expect(signTransaction).toBeTruthy();

        // Fourth Step Success Render
        await findByText('MKR successfully burned in ESM', {}, { timeout: 10000 });
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
      const el = await findByText('Initiate Emergency Shutdown', {}, { timeout: 30000 });
      expect(el).toBeTruthy();
    });

    // TODO: this test passing is a false positive bc 'waitFor' is async, but not awaited.
    // Also it doesn't appear that the button becomes disabled anyway, that should probably be fixed in esmodule.tsx.
    xtest('show disabled Initiate Shutdown button on shutdown initiated', async () => {
      const esm = maker.service('smartContract').getContract('MCD_ESM');
      await esm.fire();
      const { findByText } = await renderWithTheme(<ESModule />);
      const initiateButton = await findByText('Initiate Emergency Shutdown', {}, { timeout: 30000 });
      waitFor(() => expect(initiateButton.disabled).toBeTruthy());
      // await wait(() => getByTestId('shutdown-initiated'));
    });
  });
});
