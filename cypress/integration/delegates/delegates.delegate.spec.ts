/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import { getTestAccount } from 'cypress/support/constants/testaccounts';
import { formatAddress } from 'lib/utils';
import { closeModal, forkNetwork, resetDatabase, setAccount, visitPage } from '../../support/commons';
import { getTestAccountByIndex, TEST_ACCOUNTS } from '../../support/constants/testaccounts';

describe('Delegates Page', () => {
  before(() => {
    forkNetwork();
    resetDatabase();
  });
  // this remains in effect for the remainder of the tests in the same spec file.
  Cypress.config({ defaultCommandTimeout: 90000 });

  it('connects wallet and clicks on delegate', () => {
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
