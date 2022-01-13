/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { modalAddressEquals, modalPollingWeightEquals } from 'cypress/support/commons/account.e2e.helpers';
import { TEST_ACCOUNTS } from 'cypress/support/constants/testaccounts';
import { elementContainsText, setAccount, visitPage } from '../support/commons';

describe('Home Page', () => {
  it('should navigate to the home page page and find the title', () => {
    // Start from the index page
    visitPage('/');

    // Find the title
    elementContainsText('h1', 'Maker Governance');

    // Find the title
    cy.get('h1').contains('Maker Governance');
  });

  it('should find the stats', () => {
    // Start from the index page
    visitPage('/');

    // Find the Dai Savings Rate info
    cy.contains('Dai Savings Rate').should('be.visible');

    // Checks that we have a correct dai savings rate and other values
    elementContainsText('[data-testid="Dai Savings Rate-value"]', '0.01%');

    elementContainsText('[data-testid="Total Dai-value"]', '98,965,778 DAI');

    elementContainsText('[data-testid="Dai Debt Ceiling-value"]', '2,030,717,023 DAI');

    elementContainsText('[data-testid="System Surplus-value"]', '278,245 DAI');

    // Find the Polling Votes block
    cy.contains('Polling Votes').should('be.visible');
  });

  it('Connects wallet', () => {
    // Start from the index page
    visitPage('/');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Should find the connected
      cy.contains('0x8028e...cf0b').should('be.visible');

      // Opens modal connection and finds 5 MKR
      //click on account modal
      modalAddressEquals('0x8028e...cf0b');

      modalPollingWeightEquals('100.00 MKR');

      // Save screenshot
      cy.screenshot('test');
    });
  });
});
