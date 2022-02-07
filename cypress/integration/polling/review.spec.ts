/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress
import { TEST_ACCOUNTS } from 'cypress/support/constants/testaccounts';
import { visitPage, setAccount } from '../../support/commons';

describe('/polling review page', async () => {
  const availablePolls = 19;

  it('Renders correct information about the missing connection', () => {
    visitPage('/polling/review');

    cy.contains('Connect your wallet to review your ballot').should('be.visible');
  });

  it('Adds polls to review and navigates to review page', () => {
    visitPage('/polling');

    setAccount(TEST_ACCOUNTS.normal, () => {
      const selectChoice = cy.get('[data-testid="single-select"]');

      selectChoice.first().click();

      // click on option
      cy.get('[data-testid="single-select-option-Yes"]').first().click();

      const buttonsVote = cy.get('[data-testid="button-add-vote-to-ballot"]');

      // Click the button
      buttonsVote.first().should('not.be.disabled');

      buttonsVote.first().click();

      // Check the ballot count has increased
      cy.contains(/(1 of (18|19) available polls added to ballot)/).should('be.visible');

      // Click on the navigate
      cy.contains('Review & Submit Your Ballot').click();

      cy.location('pathname').should('eq', '/polling/review');

      // It can edit a choice
      cy.get('[data-testid="edit-poll-choice"]').click();

      // Opens the select
      cy.get('[data-testid="single-select"]').click();

      // Clicks on "No"
      cy.get('[data-testid="single-select-option-No"]').click();

      // Clicks on update vote
      cy.contains('Update vote').click();

      // Submit ballot
      cy.get('[data-testid="submit-ballot-button"]').click();

      cy.contains('Please use your wallet to sign this transaction.').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      cy.contains('Transaction Sent!').should('be.visible');

      // After finishing voting, there should be no polls
      cy.contains('There are no polls added to your ballot.').should('be.visible');
    });
  });

  it('Can remove votes from ballot on the review page', () => {
    visitPage('/polling');

    setAccount(TEST_ACCOUNTS.normal, () => {
      const selectChoice = cy.get('[data-testid="single-select"]');

      selectChoice.first().click();

      // click on option
      cy.get('[data-testid="single-select-option-Yes"]').first().click();

      const buttonsVote = cy.get('[data-testid="button-add-vote-to-ballot"]');

      // Click the button
      buttonsVote.first().should('not.be.disabled');

      buttonsVote.first().click();

      // Click on the navigate
      cy.contains('Review & Submit Your Ballot').click();

      cy.location('pathname').should('eq', '/polling/review');

      // It can edit a choice
      cy.get('[data-testid="remove-ballot-choice"]').click();

      // After finishing voting, there should be no polls
      cy.contains('There are no polls added to your ballot.').should('be.visible');
    });
  });

  xit('Adds comments', () => {
    visitPage('/polling');

    setAccount(TEST_ACCOUNTS.normal, () => {
      const selectChoice = cy.get('[data-testid="single-select"]');

      selectChoice.first().click();

      // click on option
      cy.get('[data-testid="single-select-option-Yes"]').first().click();

      const buttonsVote = cy.get('[data-testid="button-add-vote-to-ballot"]');

      // Click the button
      buttonsVote.first().should('not.be.disabled');

      buttonsVote.first().click();

      // Click on the navigate
      cy.contains('Review & Submit Your Ballot').click();

      cy.location('pathname').should('eq', '/polling/review');

      // Adds text to the comment area
      const commentText = `Comment on the e2e test suite ${Date.now()}`;
      cy.get('[data-testid="poll-comment-box"]').type(commentText);

      // The sign comments button should be visible
      cy.get('[data-testid="sign-comments-button"]').should('be.enabled');

      // The sign transacation button should be disabld
      cy.get('[data-testid="submit-ballot-button"]').should('be.disabled');

      // Sign comments
      cy.get('[data-testid="sign-comments-button"]').click();

      // The sign transacation button should be enabled
      cy.get('[data-testid="submit-ballot-button"]').should('be.enabled');

      cy.get('[data-testid="submit-ballot-button"]').click();

      // Expect to see the previously voted polls
      cy.get('[data-testid="previously-voted-on"]').should('be.visible');

      // Clicks on the title of the poll
      cy.get('[data-testid="poll-overview-card-poll-title"]').click();

      // Navigates to the detail of the poll and sees the comments tab
      cy.get('[data-testid="tab-Comments"]').should('be.visible');

      // Opens the comment tab
      cy.get('[data-testid="tab-Comments"]').click();

      // Checks the comment exists
      cy.contains(commentText).should('be.visible');
    });
  });

  // TODO: Test in mobile with the mobile ballot layout

  // TODO: Test updating a vote that you previouslt voted on

  // TODO: Test chaning to another wallet and see the previous votes dissapear.

  // TODO: See "You have not voted" change on previously voted polls.
});
