/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import { getTestAccount } from 'cypress/support/constants/testaccounts';
import { formatAddress } from 'lib/utils';
import { closeModal, forkNetwork, setAccount, visitPage } from '../support/commons';
import { getTestAccountByIndex, TEST_ACCOUNTS } from '../support/constants/testaccounts';

describe('Delegates Page', () => {
  before(() => {
    forkNetwork(INIT_BLOCK);
  });
  it('should navigate to the delegates page and find a list of delegates', () => {
    // Start from the index page
    visitPage('/delegates');

    // Find the shadow delegates
    cy.contains('Shadow Delegates').should('be.visible');
    cy.contains('Recognized Delegates').should('be.visible');

    // Mainnet delegates
    cy.get('[data-testid="delegate-card"]').its('length').should('be.gte', 0);

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Shoudl find various delegates
      cy.get('[data-testid="delegate-card"]').its('length').should('be.gte', 12).and('be.lessThan', 30);
    });
  });

  it('should find the delegates system info', () => {
    visitPage('/delegates');
    setAccount(TEST_ACCOUNTS.normal, () => {
      // Checks the total amount of delegates
      cy.get('[data-testid="total-delegates-system-info"]').contains(/25/);
      cy.get('[data-testid="total-recognized-delegates-system-info"]').contains('2');
      cy.get('[data-testid="total-shadow-delegates-system-info"]').contains(/15/);
      cy.get('[data-testid="total-mkr-system-info"]').contains('1,279');
    });
  });

  it('should hide shadow delegates when unchecking the filter', () => {
    visitPage('/delegates');

    setAccount(TEST_ACCOUNTS.normal, () => {
      cy.get('[data-testid="delegate-type-filter"]').click();

      cy.get('[data-testid="delegate-type-filter-show-recognized"]').click();

      // See now 2 delegates
      cy.get('[data-testid="delegate-card"]').should('have.length', 2);

      // Reset filters
      cy.get('[data-testid="delegate-reset-filters"]').click();

      // Now see al the delegates again
      cy.get('[data-testid="delegate-card"]').its('length').should('be.gte', 12).and('be.lessThan', 18);
    });
  });

  it('connects wallet and clicks on delegate', { defaultCommandTimeout: 90000 }, () => {
    // Start from the index page
    visitPage('/delegates');

    // const newAccount = getTestAccountByIndex(1);

    // Wait a few seconds to prevent rate limiting
    cy.wait(5000);

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Should find the connected
      cy.contains(formatAddress(TEST_ACCOUNTS.normal.address.toLowerCase())).should('be.visible');

      // Click delegate button
      cy.get('[data-testid="button-delegate"]').first().click();

      // Aprove tx
      cy.get('button').contains('Approve Delegate Contract').click();

      // Wait for tx confirmed

      cy.contains('Confirm Transaction', { timeout: 7500 }).should('be.visible');

      // Inserts the amount of MKR to delegate
      cy.contains('Deposit into delegate contract').should('be.visible');
      cy.get('[data-testid="mkr-input"]').type('2');

      cy.wait(1000);

      // Delegate
      cy.get('button').contains('Delegate MKR').click();

      // Wait for text changing
      cy.contains('You are delegating').should('be.visible');

      // Check that the etherscan link shows the correct address
      // cy.get('a[href="https://etherscan.io/address/0xb21e535fb349e4ef0520318acfe589e174b0126b"]').should('be.visible')

      // Clicks the confirm button
      cy.get('button').contains('Confirm Transaction').click();
      // Wait for tx confirmed
      cy.contains('Confirm Transaction').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      // CLose modal
      closeModal();

      // Checks that the delegated amount has appeared. Note: we round UP to two decimals places in the UI.
      cy.get('[data-testid="mkr-delegated-by-you"]').first().should('have.text', '2.0');

      // Find the undelegate button
      cy.get('[data-testid="button-undelegate"]').first().click();

      // Aprove the undelegate contract
      cy.get('button').contains('Approve Delegate Contract').click();

      // Wait for tx confirmed
      cy.contains('Confirm Transaction').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      // TODO: The remove funds from delegate test is not working well because the modal keeps showing the button
      // To approve the contract, even it's approved. We have to approve it like 3 times to work
      // Check what is the problem and uncomment the following code
      /*
      cy.contains('Withdraw from delegate contract').should('be.visible');

      cy.get('button[data-testid="mkr-input-set-max"]').click();

      // UnDelegate
      cy.get('button').contains('Undelegate MKR').click();
      cy.contains('Transaction Pending').should('be.visible');

      cy.contains('Transaction Sent').should('be.visible');

      // CLose modal
      closeModal();

      // Checks that the delegated amount has changed
      cy.get('[data-testid="mkr-delegated-by-you"]').contains('0.000');
      */
    });
  });
});
