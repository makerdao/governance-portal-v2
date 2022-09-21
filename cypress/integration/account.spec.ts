/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import { getTestAccountByIndex } from 'cypress/support/constants/testaccounts';
import { forkNetwork, setAccount, visitPage } from '../support/commons';

describe('Account Page', async () => {
  before(() => {
    forkNetwork(INIT_BLOCK);
  });

  it('should navigate to the account page and be able to create a delegate contract', () => {
    visitPage('/account');

    cy.contains('Connect wallet').should('be.visible');

    const newAccount = getTestAccountByIndex(0);

    setAccount(newAccount, async () => {
      cy.contains('No vote delegate contract detected').should('be.visible');

      // Accept checkbox
      cy.get('[data-testid="checkbox-create-delegate"]').click();

      // Click on create
      cy.get('[data-testid="create-button"]').click();

      // See transaction go through
      cy.contains('Confirm Transaction').should('be.visible');
      cy.contains('Transaction Pending').should('be.visible');
      cy.contains('Transaction Sent').should('be.visible');

      cy.contains('Close').click();

      // Find the text of delegated MKR
      cy.contains('Total MKR Delegated').should('be.visible');

      const text = await new Cypress.Promise<string>(resolve => {
        cy.get('[data-testid="vote-delegate-address"]')
          .invoke('text')
          .then(txt => resolve(txt.toString()));
      });

      // We can return "text" after creating the delegate through the ui
    });
  });

  it('should show locked balance in chief and allow to withdraw', () => {
    // Deposits in chief
    visitPage('/executive');

    const newAccount = getTestAccountByIndex(3);

    setAccount(newAccount, () => {
      // Click deposit
      cy.get('[data-testid="deposit-button"]').click();

      // Click approve contract
      cy.get('[data-testid="deposit-approve-button"]').click();

      // Deposit
      cy.contains(/Deposit into voting contract/).should('be.visible');

      // Deposit
      cy.get('[data-testid="mkr-input"]').type('0.01');

      // Click button
      cy.get('[data-testid="button-deposit-mkr"]').click();

      // Check MKR
      cy.get('[data-testid="locked-mkr"]').should('have.text', '0.01 MKR');

      // Goes to the account page
      visitPage('/account', true);

      setAccount(newAccount, () => {
        cy.contains(/You have a DSChief balance of 0.01 MKR/).should('be.visible');

        // Clicks on withdraw
        cy.get('[data-testid="withdraw-button"]').click();

        // Waits for the withdraw approve text to appear
        cy.contains(/Approve voting contract/).should('be.visible');

        // Approves withdraw
        cy.get('[data-testid="withdraw-approve-button"]').click();

        // Wait for tx completion
        cy.contains(/Withdraw from voting contract/).should('be.visible');
        cy.contains(/Input the amount of MKR to withdraw from the voting contract/).should('be.visible');

        cy.get('[data-testid="mkr-input"]').type('0.005');

        cy.get('[data-testid="button-withdraw-mkr"]').click();

        cy.contains(/You have a DSChief balance of 0.005 MKR./).should('be.visible');
      });
    });
  });
});
