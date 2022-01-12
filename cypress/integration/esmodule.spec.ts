/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { sendETH, sendMKR } from 'cypress/support/commons/token.helpers';
import { getTestAccount, TEST_ACCOUNTS } from 'cypress/support/constants/testaccounts';
import { formatAddress } from 'lib/utils';
import { closeModal, setAccount, visitPage } from '../support/commons';

describe('Esmodule Page', async () => {
  it('should navigate to the es module page', () => {
    visitPage('/esmodule');

    cy.contains('Emergency Shutdown Module').should('be.visible');

    cy.get('[data-testid="total-mkr-esmodule-staked"]').contains('1.411110 MKR');

    // Checks the info of no account connected appears
    cy.contains('No Account Connected').should('be.visible');
  });

  it('Should be able to burn mkr', () => {
    visitPage('/esmodule');

    const newAccount = getTestAccount();

    sendMKR(newAccount.address, 0.5);
    sendETH(newAccount.address, 0.5);

    setAccount(newAccount, async () => {
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
      cy.contains('I am burning 0.01 MKR').should('be.visible');

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
      cy.contains('Sign Transaction').should('be.visible');
      cy.contains('Transaction Pending').should('be.visible');

      // See confirmation
      cy.contains('MKR successfully burned in ESM').should('be.visible');

      // Close modal
      cy.contains('Close').click();

      // The total burned increased
      cy.contains('1.431110 MKR').should('be.visible');
    });
  });
});

// TODO: Enter an incorrect passphrase

// TODO: Initate emergency shutdown by burning 50000 MKR
