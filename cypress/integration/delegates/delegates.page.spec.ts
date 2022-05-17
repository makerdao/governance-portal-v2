/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import { forkNetwork, setAccount, visitPage } from '../../support/commons';
import { TEST_ACCOUNTS } from '../../support/constants/testaccounts';

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
      cy.get('[data-testid="total-delegates-system-info"]').contains(/20/);
      cy.get('[data-testid="total-recognized-delegates-system-info"]').contains('2');
      cy.get('[data-testid="total-shadow-delegates-system-info"]').contains(/18/);
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
      cy.get('[data-testid="delegate-card"]').its('length').should('be.gte', 12).and('be.lessThan', 25);
    });
  });
});
