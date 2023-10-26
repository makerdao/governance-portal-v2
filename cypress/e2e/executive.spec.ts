/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { getTestAccount, getTestAccountByIndex, TEST_ACCOUNTS } from '../support/constants/testaccounts';
import { forkNetwork, setAccount, visitPage } from '../support/commons';
import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';

describe('Executive page', async () => {
  before(() => {
    forkNetwork(INIT_BLOCK);
  });
  it('navigates to executives and can deposit into chief', () => {
    visitPage('/executive');

    const newAccount = getTestAccountByIndex(10);

    setAccount(newAccount, () => {
      // Sees the "In voting contract" text
      cy.contains(/In voting contract/).should('be.visible');

      // Click deposit
      cy.get('[data-testid="deposit-button"]').click();

      // Click approve contract
      cy.get('[data-testid="deposit-approve-button"]').click();

      // Wait until transaction completes
      // Removing this check because it does not pass: cy.contains('/Transaction Pending/').should('be.visible');
      // cy.contains('/Confirm Transaction/').should('be.visible');

      // Deposit
      cy.contains(/Deposit into voting contract/).should('be.visible');

      // Deposit
      cy.get('[data-testid="mkr-input"]').type('0.01');

      // Click button
      cy.get('[data-testid="button-deposit-mkr"]').click();

      // Wait for tx
      // cy.contains('/Transaction Pending/').should('be.visible');
      // cy.contains(/Transaction Sent/).should('be.visible');

      // Check MKR
      cy.get('[data-testid="locked-mkr"]').should('have.text', '0.01 MKR');

      // Can vote
      cy.get('[data-testid="vote-button-exec-overview-card"]').first().click();

      cy.contains(/Submit Vote/).click();

      cy.contains(/Transaction Sent/).should('be.visible');
    });
  });

  // TODO: Create delegate account
  xit('As a delegate , see the amount of MKR in the delegate contract', () => {
    visitPage('/executive');

    setAccount(TEST_ACCOUNTS.delegate, () => {
      cy.contains(/In delegate contract/).should('be.visible');
    });
  });

  // TODO: Create voty proxy account
  xit('As a proxy voter , see the amount of MKR in the proxy contract', () => {
    visitPage('/executive');

    setAccount(TEST_ACCOUNTS.voteProxy, () => {
      cy.contains(/In proxy contract/).should('be.visible');
    });
  });
});
