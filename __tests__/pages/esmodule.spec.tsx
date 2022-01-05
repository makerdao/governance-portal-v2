import { renderWithTheme, UINT256_MAX, WAD } from '../helpers';
import { act, waitFor, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import waitForExpect from 'wait-for-expect';
import { TestAccountProvider } from '@makerdao/test-helpers';
import ESModule from '../../pages/esmodule';
import getMaker from '../../lib/maker';
import { accountsApi } from '../../modules/app/stores/accounts';
import { ethers } from 'ethers';

let maker;
describe('/esmodule page', () => {
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

  describe('the page renders', () => {
    // tests render on mobile view automatically
    test('show progress bar', () => {
      renderWithTheme(<ESModule />);
      const progressBar = screen.getByTestId('progress-ring');
      expect(progressBar).toBeInTheDocument();
    });

    test('show esm history', async () => {
      renderWithTheme(<ESModule />);

      const title = await screen.findByText('ESM History');
      expect(title).toBeInTheDocument();
    });

    test('show "Burn your MKR" button', async () => {
      renderWithTheme(<ESModule />);

      const buttonBurn = await screen.findByText('Burn Your MKR', {}, { timeout: 15000 });
      expect(buttonBurn).toBeInTheDocument();
      // Initiate Emergency Shutdow
    });
  });

  describe('can navigate modal flow to burn MKR', () => {
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

    test('burn MKR in modal flow', async () => {
      renderWithTheme(<ESModule />);

      // Intro Render
      // await wait(() =>
      //   screen.getByText('The Emergency Shutdown Module (ESM) is responsible for', {
      //     exact: false
      //   })
      // );
      // click(screen.getByText('Continue'));

      // First Step Render
      const burnButton = await screen.findByText('Burn Your MKR', {}, { timeout: 5000 });
      act(() => {
        userEvent.click(burnButton);
      });
      await screen.findByText('Are you sure you want to burn MKR?');
      act(() => {
        userEvent.click(screen.getByText('Continue'));
      });

      // Second Step Render
      await screen.findByText('Enter the amount of MKR to burn');

      // Not Enough MKR Check
      const amount = '35';
      act(() => {
        userEvent.type(screen.getByTestId('mkr-input'), amount);
      });
      const tooLow = await screen.findByText('MKR balance too low', {}, { timeout: 3000 });
      expect(tooLow).toBeInTheDocument();

      // Wait until user balance is loaded
      await screen.findByTestId('mkr-input-balance');

      // await wait(() => screen.getByText("You don't have enough MKR"));
      const input = screen.getByTestId('mkr-input');
      const continueButton = screen.getByText('Continue');

      expect(continueButton).toBeDisabled();

      // Set Max Check
      const setMaxButton = screen.getByTestId('mkr-input-set-max');
      // Click on the button
      act(() => {
        userEvent.click(setMaxButton);
      });
      expect(input).toHaveValue(2.0);

      // Valid Amount Check

      // userEvent type doesn't work on this input
      fireEvent.change(input, { target: { value: 1 } });
      await waitFor(() => expect(continueButton).toBeEnabled());

      expect(continueButton).toBeEnabled();
      act(() => {
        userEvent.click(continueButton);
      });

      // Third Step Render
      await screen.findByText('Burn amount', {}, { timeout: 5000 });
      await screen.findByText('New ESM total');

      const burnMKRbutton = await screen.findByText('Continue');
      await waitFor(() => expect(burnMKRbutton).toBeDisabled());

      // click the terms of service
      const tos = await screen.findByTestId('tosCheck');
      act(() => {
        userEvent.click(tos);
      });
      await waitFor(() => expect(tos).toBeChecked());

      // click the unlock mkr
      const allowanceBtn = await screen.findByTestId('allowance-toggle');
      expect(allowanceBtn).toBeEnabled();
      act(() => {
        userEvent.click(allowanceBtn);
      });
      await waitFor(() => expect(allowanceBtn).toBeDisabled());

      const confirmInput = screen.getByTestId('confirm-input');
      // Incorrect Input Check

      // userEvent type doesn't work on this input
      fireEvent.change(confirmInput, { target: { value: 'I am burning 2.00 MKR' } });
      await waitFor(() => expect(burnMKRbutton).toBeDisabled());

      act(() => {
        // userEvent type doesn't work on this input
        fireEvent.change(confirmInput, { target: { value: 'I am burning 1.00 MKR' } });
      });

      await waitFor(() => expect(burnMKRbutton).toBeEnabled());

      act(() => {
        userEvent.click(burnMKRbutton);
      });

      // Third Step Render
      const signTransaction = await screen.findByText('Sign Transaction');
      expect(signTransaction).toBeInTheDocument();

      // Fourth Step Success Render
      await screen.findByText('MKR successfully burned in ESM', {}, { timeout: 10000 });
    });
  });

  describe('can initiate emergency shutdown', () => {
    beforeAll(async () => {
      maker = await getMaker();
      await maker.service('accounts').useAccount('default');
      const token = maker.service('smartContract').getContract('MCD_GOV');
      await token['mint(uint256)'](WAD.times(50000).toFixed());
      const esm = maker.service('smartContract').getContract('MCD_ESM');
      await token.approve(esm.address, ethers.BigNumber.from(UINT256_MAX)); //approve unlimited
      await esm.join(WAD.times(50000).toFixed());
    });

    test('show initiate shutdown button on threshold reached', async () => {
      await renderWithTheme(<ESModule />);
      const el = await screen.findByText('Initiate Emergency Shutdown', {}, { timeout: 30000 });
      expect(el).toBeInTheDocument();
    });

    // TODO: this test passing is a false positive bc 'waitFor' is async, but not awaited.
    // Also it doesn't appear that the button becomes disabled anyway, that should probably be fixed in esmodule.tsx.
    xtest('show disabled initiate shutdown button on shutdown initiated', async () => {
      const esm = maker.service('smartContract').getContract('MCD_ESM');
      await esm.fire();
      await renderWithTheme(<ESModule />);
      const initiateButton = await screen.findByText('Initiate Emergency Shutdown', {}, { timeout: 30000 });
      await waitFor(() => expect(initiateButton).toBeDisabled());
      // await wait(() => screen.getByTestId('shutdown-initiated'));
    });
  });
});
