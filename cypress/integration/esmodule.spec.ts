/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { getTestAccountByIndex, TEST_ACCOUNTS } from '../support/constants/testaccounts';
import { setAccount, visitPage, forkNetwork } from '../support/commons';
import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';

describe('Esmodule Page', async () => {
  before(() => {
    forkNetwork(INIT_BLOCK);
  });

  it('should navigate to the es module page', () => {
    visitPage('/esmodule');

    // Checks the info of no account connected appears
    cy.contains('No Account Connected').should('be.visible');
    cy.contains('Emergency Shutdown Module').should('be.visible');
    setAccount(TEST_ACCOUNTS.normal, () => {
      cy.get('[data-testid="total-mkr-esmodule-staked"]').should('be.visible');

      cy.contains(/0.003/).should('be.visible');
    });
  });

  it('Should be able to burn mkr', () => {
    visitPage('/esmodule');

    const newAccount = getTestAccountByIndex(2);

    setAccount(newAccount, () => {
      cy.contains('Burn Your MKR').should('be.visible');

      // Click "burn your MKR button"
      cy.contains('Burn Your MKR').click();

      // Checks the modal is open
      cy.contains('Are you sure you want to burn MKR?').should('be.visible');

      // Closes modal
      cy.contains('Cancel').click();

      // Click "burn your MKR button"
      cy.contains('Burn Your MKR').click();

      // Click continue
      cy.contains('Continue').click();

      // Enter 0.01 MKR
      cy.get('[data-testid="mkr-input"]').type('0.01');

      // Continue with the burn
      cy.contains('Continue').click();

      // Check that the passphrase form appears
      // TODO: This should render more than 2 decimals
      // cy.contains('I am burning 0.01 MKR').should('be.visible');

      // Type the passphrase
      cy.get('[data-testid="confirm-input"]').type('I am burning 0.01 MKR');

      // Unlock mkr
      cy.get('[data-testid="allowance-toggle"]').click();

      // click on checkbox of accepted terms
      cy.get('[data-testid="tosCheck"]').click();

      // The continue button should be enabled
      cy.get('[data-testid="continue-burn"]').should('not.be.disabled');

      // Click continue
      cy.get('[data-testid="continue-burn"]').click();

      // Should see the transaction
      //cy.contains('Sign Transaction').should('be.visible');
      //cy.contains('Transaction Pending').should('be.visible');

      // See confirmation
      cy.contains('MKR successfully burned in ESM').should('be.visible');

      // Close modal
      cy.contains('Close').click();

      cy.wait(1500);

      // Scroll for screenshot
      cy.scrollTo(0, 0);

      // The total burned increased
      cy.get('[data-testid="total-mkr-esmodule-staked"]').contains(/0.013/);
    });
  });

  // this remains in effect for the remainder of the tests in the same spec file.
  Cypress.config({ defaultCommandTimeout: 60000 });

  it('Should be able to initiate emergency shutdown', () => {
    visitPage('/esmodule');
    cy.wait(2000);
    setAccount(TEST_ACCOUNTS.normal, () => {
      cy.contains('Burn Your MKR').should('be.visible');

      //Click "burn your MKR button"
      cy.contains('Burn Your MKR').click();

      // Checks the modal is open
      cy.contains('Are you sure you want to burn MKR?').should('be.visible');

      // Closes modal
      cy.contains('Cancel').click();

      // Click "burn your MKR button"
      cy.contains('Burn Your MKR').click();

      // Click continue
      cy.contains('Continue').click();

      // Enter 100K MKR to pass the threshhold
      cy.get('[data-testid="mkr-input"]').type('100000');

      // Continue with the burn
      cy.contains('Continue').click();

      // Type the passphrase
      cy.get('[data-testid="confirm-input"]').type('I am burning 100,000 MKR');

      // Unlock mkr
      cy.get('[data-testid="allowance-toggle"]').click();

      // click on checkbox of accepted terms
      cy.get('[data-testid="tosCheck"]').click();

      // The continue button should be enabled
      cy.get('[data-testid="continue-burn"]').should('not.be.disabled');

      // Click continue
      cy.get('[data-testid="continue-burn"]').click();

      // See confirmation
      cy.contains('MKR successfully burned in ESM').should('be.visible');

      // Close modal
      cy.contains('Close').click();

      // Click "burn your MKR button"
      cy.contains('Initiate Emergency Shutdown').click();

      // See that the limit has been reached
      cy.contains('The 100,000 MKR limit for the emergency shutdown module has been reached.').should(
        'be.visible'
      );

      // Continue and send the shutdown tx
      cy.contains('Continue').click();

      // Pending state
      cy.contains('Shutdown will update once the transaction has been confirmed.');

      // cy.wait(3500);
      // Scroll for screenshot
      cy.scrollTo(0, 0);

      // Shows banner after shutdown
      // TODO fix cageTime showing incorrect date
      // cy.contains('Emergency shutdown has been initiated on');
      cy.get('[data-testid="es-initiated"]').contains('Emergency shutdown has been initiated on');
    });
  });
});

// TODO: Enter an incorrect passphrase

/*
import { renderWithTheme, UINT256_MAX, WAD } from '../helpers';
import { waitFor, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import waitForExpect from 'wait-for-expect';
import { TestAccountProvider } from '@makerdao/test-helpers';
import ESModule from '../../pages/esmodule';
import { accountsApi } from '../../modules/app/stores/accounts';
import { ethers } from 'ethers';
import { WAD } from '../../modules/web3/web3.constants';

export const UINT256_MAX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

configure({
  getElementError: (message, container) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    error.stack = null;
    return error;
  }
});

let maker;
describe('/esmodule page', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
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

      // First Step Render
      const burnButton = await screen.findByText('Burn Your MKR', {}, { timeout: 5000 });
      userEvent.click(burnButton);
      await screen.findByText('Are you sure you want to burn MKR?');
      userEvent.click(screen.getByText('Continue'));

      // Second Step Render
      await screen.findByText('Enter the amount of MKR to burn');

      // Not Enough MKR Check
      const amount = '35';
      userEvent.type(screen.getByTestId('mkr-input'), amount);
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
      userEvent.click(setMaxButton);
      expect(input).toHaveValue(2.0);

      // Valid Amount Check

      // userEvent type doesn't work on this input
      fireEvent.change(input, { target: { value: 1 } });
      await waitFor(() => expect(continueButton).toBeEnabled());

      expect(continueButton).toBeEnabled();
      userEvent.click(continueButton);

      // Third Step Render
      await screen.findByText('Burn amount', {}, { timeout: 5000 });
      await screen.findByText('New ESM total');

      const burnMKRbutton = await screen.findByText('Continue');
      await waitFor(() => expect(burnMKRbutton).toBeDisabled());

      // click the terms of service
      const tos = await screen.findByTestId('tosCheck');
      userEvent.click(tos);
      await waitFor(() => expect(tos).toBeChecked());

      // click the unlock mkr
      const allowanceBtn = await screen.findByTestId('allowance-toggle');
      expect(allowanceBtn).toBeEnabled();
      userEvent.click(allowanceBtn);
      await waitFor(() => expect(allowanceBtn).toBeDisabled());

      const confirmInput = screen.getByTestId('confirm-input');
      // Incorrect Input Check

      // userEvent type doesn't work on this input
      fireEvent.change(confirmInput, { target: { value: 'I am burning 2.00 MKR' } });
      await waitFor(() => expect(burnMKRbutton).toBeDisabled());

      // userEvent type doesn't work on this input
      fireEvent.change(confirmInput, { target: { value: 'I am burning 1.00 MKR' } });

      await waitFor(() => expect(burnMKRbutton).toBeEnabled());

      userEvent.click(burnMKRbutton);

      // Third Step Render
      const signTransaction = await screen.findByText('Sign Transaction');
      expect(signTransaction).toBeInTheDocument();

      // Fourth Step Success Render
      await screen.findByText('MKR successfully burned in ESM', {}, { timeout: 10000 });
    });
  });

  describe('can initiate emergency shutdown', () => {
    beforeAll(async () => {
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

*/
