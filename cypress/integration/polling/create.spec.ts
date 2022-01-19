/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress
import { visitPage } from '../../support/commons';

describe('/polling create page', async () => {
  it('validates correct poll', () => {
    visitPage('/polling/create');

    const urlMetadata =
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Add%20the%20Aave%20Direct%20Deposit%20DAI%20Module%20-%20October%2011%2C%202021.md';

    // The button to create the poll should be disabled
    cy.get('[data-testid="button-create-poll"]').should('be.disabled');

    // Input poll metadata url
    cy.get('[name="url"]').type(urlMetadata);

    // Click validate button
    cy.contains('Validate').click();

    // Wait for the poll data to load
    cy.get('Add the Aave Direct Deposit DAI Module (D3M) - October 11, 2021').should('be.visible');

    cy.get('[data-testid="button-create-poll"]').should('not.be.disabled');
  });

  // TODO: Check that an invalid poll shows error

  // TODO: Confirm creating the transactions
});
