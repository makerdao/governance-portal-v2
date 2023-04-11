/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress
import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import {
  TESTING_ACTIVE_POLLS_COUNT,
  TESTING_ENDED_POLLS_COUNT,
  TESTING_TOTAL_POLLS_COUNT
} from 'cypress/support/constants/polling';
import { TEST_ACCOUNTS } from 'cypress/support/constants/testaccounts';
import { forkNetwork, resetDatabase, setAccount, visitPage } from '../support/commons';

describe('/polling page', async () => {
  before(() => {
    forkNetwork();
    resetDatabase();
  });
  it('renders active polls', () => {
    visitPage('/polling');

    setAccount(TEST_ACCOUNTS.normal, () => {
      cy.contains('Active Polls').should('be.visible');

      cy.contains(/1 POLL - ENDING DEC 02 2023 16:00 UTC/, {
        matchCase: false
      }).should('be.visible');

      cy.get('[data-testid="poll-overview-card"]').its('length').should('be.eq', TESTING_ACTIVE_POLLS_COUNT);

      // Poll card should display poll ID
      cy.contains('Poll ID 4').should('be.visible');

      // Show ended polls
      cy.get('[data-testid="button-view-ended-polls"]').click();

      // Check that now shows all polls
      cy.get('[data-testid="poll-overview-card"]').its('length').should('be.eq', TESTING_TOTAL_POLLS_COUNT);
    });
  });

  it('Shows ballot when account is connected', () => {
    visitPage('/polling');
    setAccount(TEST_ACCOUNTS.normal, () => {
      cy.contains('Your Ballot').should('be.visible');
      cy.contains('View Details').should('be.visible');
      cy.contains('Add vote to ballot').should('be.visible');
      cy.get('[data-testid="countdown timer"]').should('be.visible');
    });
  });

  it('Does not show ballot when account is not connected', () => {
    visitPage('/polling');
    cy.get('[data-testid="your-ballot-title"]').should('not.exist');
  });

  it('Filters by ended polls', () => {
    visitPage('/polling');
    setAccount(TEST_ACCOUNTS.normal, () => {
      cy.get('[data-testid="poll-filters-status"]').click();
      cy.get('[data-testid="checkbox-show-polls-ended"]').click();

      cy.get('[data-testid="poll-overview-card"]').should('have.length', TESTING_ENDED_POLLS_COUNT);

      cy.contains('Ended Polls').should('be.visible');
    });
  });

  // TODO: Should allow to vote on a ranked choice and chose different options in order
  /*

  test('ranked choice options render properly', async () => {
    const select = await screen.findByTestId('ranked choice');
    const options = await screen.findAllByTestId('ranked choice option');

    expect(select).toBeInTheDocument();
    expect(options.length).toBe(7);
    expect(await screen.findByText('0', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('0.25', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('0.5', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('1', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('2', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('4', { selector: 'li' })).toBeInTheDocument();
  });
  
  */

  // TODO: Check that filters work

  // TODO: Check that navigates to detail

  // TODO: Check edit choice button works

  // TODO: Check add to ballot works

  // TODO: Check review and submit works
});
