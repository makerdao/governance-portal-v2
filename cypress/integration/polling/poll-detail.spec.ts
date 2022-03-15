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
    visitPage('/polling/QmWReBMh');

    // REnders the title
    cy.contains('PPG - Open Market Committee Proposal - January 31, 2022').should('be.visible');

    // Renders the date
    cy.contains('Feb 01 2022 22:49 UTC').should('be.visible');

    // Your vote does not exist
    cy.get('[data-testid="poll-vote-box"]').should('not.exist');
  });

  it('Sees the vote box if connected', () => {
    // Mainnet poll
    visitPage('/polling/QmWReBMh');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Shows the vote box
      cy.get('[data-testid="poll-vote-box"]').should('be.visible');
    });
  });

  it('Can navigate on different tabs', () => {
    // Goerli-fork Poll
    visitPage('/polling/QmNSjvej');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Checks that the leading option is visible
      cy.contains(/Leading option: Yes with/).should('be.visible');

      // Clicks on the vote breakdown tab
      cy.get('[data-testid="tab-Vote Breakdown"]').click();

      // Should show voting stats
      cy.contains(/Voting Stats/).should('be.visible');

      // Shows the votes by address
      cy.contains(/Voting By Address/).should('be.visible');

      // Checks that are different votes by address
      cy.get('[data-testid="vote-by-address"]').its('length').should('be.greaterThan', 13);

      // Checks that there is a vote with 799.00 MKR
      cy.contains(/799.00 MKR/).should('be.visible');

      // Checks that the voting weight module is visible
      cy.contains(/Voting Weight/).should('be.visible');

      // TODO: Check the voting weight circles show correct amount
      // TODO: Check that the vote breakdown shows correct percentages
    });
  });

  // TODO: Click tabs
});
