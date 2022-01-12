/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { sendETH, sendMKR } from 'cypress/support/commons/token.helpers';
import { getTestAccount, TEST_ACCOUNTS } from 'cypress/support/constants/testaccounts';
import { formatAddress } from 'lib/utils';
import { closeModal,  setAccount, visitPage } from '../support/commons';

describe('Account Page', async () => {
  it('should navigate to the account page and be able to create a delegate contract', () => {
    // Start from the index page
    visitPage('/account');

    cy.contains('Connect your wallet to view information about your account').should('be.visible')

    const newAccount = getTestAccount();

    sendMKR(newAccount.address, 0.5);
    sendETH(newAccount.address, 0.5);

    setAccount(newAccount, async () => {
        
        cy.contains('No vote delegate contract detected').should('be.visible');

        // Accept checkbox
        cy.get('[data-testid="checkbox-create-delegate"]').click()

        // Click on create
        cy.get('[data-testid="create-button"]').click();

        // See transaction go through
        cy.contains('Confirm Transaction').should('be.visible')
        cy.contains('Transaction Pending').should('be.visible')
        cy.contains('Transaction Sent').should('be.visible')
        
        cy.contains('Close').click();

        // Find the text of delegated MKR
        cy.contains('Delegated MKR').should('be.visible')

        const text = await new Cypress.Promise<string>((resolve) => {
            cy.get('[data-testid="vote-delegate-address"]')
              .invoke('text')
              .then((txt) => resolve(txt.toString()))
          })

       // We can return "text" after creating the delegate through the ui
    });
  });

});
