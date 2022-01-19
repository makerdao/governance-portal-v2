/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress
import { setAccount, visitPage } from '../../support/commons';
import { TEST_ACCOUNTS } from '../../support/constants/testaccounts';

describe('/polling detail page', async () => {
  it('can see poll detail', () => {
    visitPage('/polling/QmQfyQyn');

    // REnders the title
    cy.contains('Community Greenlight Poll - CurveLP-stETH-ETH (Curve) - October 4, 2021').should(
      'be.visible'
    );

    // Renders the date
    cy.contains('POSTED OCT 06 2021 13:39 UTC').should('be.visible');

    // Your vote does not exist
    cy.get('[data-testid="poll-vote-box""]').should('not.exist');
  });

  it('Sees the vote box if connected', () => {
    visitPage('/polling/QmQfyQyn');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Shows the vote box
      cy.get('[data-testid="poll-vote-box""]').should('be.visible');
    });
  });

  // TODO: Click tabs

  // TODO: Show breakdown

  // TODO: Show comments
});
