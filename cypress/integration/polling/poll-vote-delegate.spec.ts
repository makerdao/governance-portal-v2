/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress
import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import { getTestAccount, getTestAccountByIndex, TEST_ACCOUNTS } from 'cypress/support/constants/testaccounts';
import { visitPage, setAccount, forkNetwork, resetDatabase } from '../../support/commons';

describe('/polling/review page as a delegate', async () => {
  before(() => {
    forkNetwork();
    resetDatabase();
  });

  it('Can legacy vote as a delegate', () => {
    // visitPage(`/address/0x6eb08a8f2b6c6d0dcc2e935872562bafc5599c3e`);
    visitPage('/polling');
    setAccount(TEST_ACCOUNTS.delegate, () => {
      const selectChoice = cy.get('[data-testid="single-select"]');

      // Use 2nd element because the first is unreliable due to a hash/slug clash with another poll
      selectChoice.eq(1).click();

      // click on option
      cy.get('[data-testid="single-select-option-Yes"]').eq(1).click();

      const buttonsVote = cy.get('[data-testid="button-add-vote-to-ballot"]');

      // Click the button
      buttonsVote.eq(1).should('not.be.disabled');

      buttonsVote.first().click();

      // Click on the navigate
      cy.contains('Review & Submit Your Ballot').click();

      cy.location('pathname').should('eq', '/polling/review');
      // The sign transacation button should be enabled
      cy.get('[data-testid="submit-ballot-button"]').should('be.enabled');

      cy.get('[data-testid="submit-ballot-button"]').first().click();

      // Switch to legacy voting for this test
      cy.get('[data-testid="switch-to-legacy-voting-button"]').click();

      cy.contains(
        'Submit your vote by creating a transaction and sending it to the polling contract on Ethereum Mainnet.'
      ).should('be.visible');

      // Click legacy voting submit button
      cy.get('[data-testid="submit-ballot-legacy-button"]').click();

      cy.contains('Please use your wallet to sign').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      // Expect to see the previously voted polls
      cy.get('[data-testid="previously-voted-on"]')
        .eq(0)
        .find('a')
        .first()
        .invoke('attr', 'href')
        .then(hrefComment1 => {
          visitPage(hrefComment1 as string, true);

          setAccount(TEST_ACCOUNTS.normal, () => {
            // Opens the comment tab
            cy.get('[data-testid="tab-Vote Breakdown"]').click();

            // Check that the vote exists
            // TODO: Right now we have no way to see if the delegate voted, because the results are indexed by spock.
            // Shows the votes by address
            cy.contains(/Voting By Address/).should('be.visible');
          });
        });
    });
  });
});
