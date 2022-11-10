/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import {
  TESTING_MKR_DELEGATED_AMOUNT,
  TESTING_RECOGNIZED_DELEGATE_COUNT,
  TESTING_SHADOW_DELEGATE_COUNT,
  TESTING_TOTAL_DELEGATE_COUNT
} from 'cypress/support/constants/delegates';
import { forkNetwork, resetDatabase, setAccount, visitPage } from '../../support/commons';
import { TEST_ACCOUNTS } from '../../support/constants/testaccounts';

describe('Delegates Page', () => {
  before(() => {
    forkNetwork();
    resetDatabase();
  });
  it('should navigate to the delegates page and find a list of delegates', () => {
    // Start from the index page
    visitPage('/delegates');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Find the shadow delegates
      cy.contains('Shadow Delegates').should('be.visible');
      cy.contains('Recognized Delegates').should('be.visible');

      // Shoudl find various delegates
      cy.get('[data-testid="delegate-card"]').should('have.length', TESTING_TOTAL_DELEGATE_COUNT);
    });
  });

  it('should find the delegates system info', () => {
    visitPage('/delegates');
    setAccount(TEST_ACCOUNTS.normal, () => {
      // Checks the total amount of delegates
      cy.get('[data-testid="total-delegates-system-info"]').contains(TESTING_TOTAL_DELEGATE_COUNT);
      cy.get('[data-testid="total-recognized-delegates-system-info"]').contains(
        TESTING_RECOGNIZED_DELEGATE_COUNT
      );
      cy.get('[data-testid="total-shadow-delegates-system-info"]').contains(TESTING_SHADOW_DELEGATE_COUNT);
      cy.get('[data-testid="total-mkr-system-info"]').contains(TESTING_MKR_DELEGATED_AMOUNT);
    });
  });

  it('should hide shadow delegates when unchecking the filter', () => {
    visitPage('/delegates');

    setAccount(TEST_ACCOUNTS.normal, () => {
      cy.get('[data-testid="delegate-type-filter"]').click();

      cy.get('[data-testid="delegate-type-filter-show-recognized"]').click();

      // See now 2 delegates
      cy.get('[data-testid="delegate-card"]').should('have.length', TESTING_RECOGNIZED_DELEGATE_COUNT);

      // Reset filters
      cy.get('[data-testid="delegate-reset-filters"]').click();

      // Now see al the delegates again
      cy.get('[data-testid="delegate-card"]').should('have.length', TESTING_TOTAL_DELEGATE_COUNT);
    });
  });
});
