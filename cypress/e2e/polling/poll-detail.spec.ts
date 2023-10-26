/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress
import { forkNetwork, setAccount, visitPage } from '../../support/commons';
import { TEST_ACCOUNTS } from '../../support/constants/testaccounts';
import { INIT_BLOCK } from '../../support/constants/blockNumbers';

describe('/polling detail page', async () => {
  before(() => {
    forkNetwork(INIT_BLOCK);
  });

  it('can see poll detail', () => {
    // Mainnet poll
    visitPage('/polling/Qmdd4Pg7');

    // REnders the title
    cy.contains('Adding Rate Limiter to Flap Auctions - February 28, 2022').should('be.visible');

    // Renders the date
    cy.contains(/POSTED FEB 28 2022 16:00 UTC | POLL ID 749/i).should('be.visible');

    // Your vote does not exist
    cy.get('[data-testid="poll-vote-box"]').should('not.exist');
  });

  // TODO: requires an active poll to be added to goerlifork
  xit('Sees the vote box if connected', () => {
    // Goerli-fork Poll
    visitPage('/polling/QmNSjvej');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Shows the vote box
      cy.get('[data-testid="poll-vote-box"]').should('be.visible');
    });
  });

  it('Can navigate on different tabs', () => {
    // Goerli-fork Poll
    visitPage('/polling/QmPcQ5vn');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Should show vote breakdown
      cy.contains(/Vote Breakdown/).should('be.visible');

      // Should show vote options
      cy.contains(/Yes/).should('be.visible');
      cy.contains(/No/).should('be.visible');
      cy.contains(/Abstain/).should('be.visible');

      // Clicks on the vote breakdown tab
      cy.get('[data-testid="tab-Vote Breakdown"]').click();

      // Should show voting stats
      cy.contains(/Voting Stats/).should('be.visible');

      // Shows the votes by address
      cy.contains(/Voting By Address/).should('be.visible');

      // Checks that are different votes by address
      cy.get('[data-testid="vote-by-address"]').should('be.visible');

      // Checks that the voting weight module is visible
      cy.contains(/Voting Weight/).should('be.visible');

      // TODO: Check the voting weight circles show correct amount
      // TODO: Check that the vote breakdown shows correct percentages
    });
  });

  // TODO: Click tabs
});
