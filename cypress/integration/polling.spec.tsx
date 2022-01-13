/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress
import { TEST_ACCOUNTS } from 'cypress/support/constants/testaccounts';
import { setAccount, visitPage } from '../support/commons';

describe('/polling page', async () => {
  it('renders active polls', () => {
    visitPage('/polling');

    cy.contains('Active Polls').should('be.visible');

    cy.contains('2 POLLS - ENDING NOV 04 2022 16:00 UTC').should('be.visible');

    cy.get('[data-testid="poll-overview-card"]').should('have.length', 4);

    // Show ended polls
    cy.get('[data-testid="button-view-ended-polls"]').click();

    cy.get('[data-testid="poll-overview-card"]').should('have.length', 6);
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
    cy.contains('Your Ballot').should('not.be.visible');
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
