/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress
import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import { getTestAccountByIndex, TEST_ACCOUNTS } from 'cypress/support/constants/testaccounts';
import { visitPage, setAccount, forkNetwork, fundAccounts, resetDatabase } from '../../support/commons';

const mockRelayRes = {
  recentlyUsedGaslessVoting: null,
  hasMkrRequired: true,
  alreadyVoted: false,
  relayBalance: '0.99766447864494'
};

describe('/polling/review page', async () => {
  before(() => {
    forkNetwork();
    resetDatabase();
  });

  it('Renders correct information about the missing connection', () => {
    visitPage('/polling/review');

    cy.contains('Connect your wallet to review your ballot').should('be.visible');
  });

  it('Adds polls to review and navigates to review page and votes with the legacy system', () => {
    visitPage('/polling');

    setAccount(TEST_ACCOUNTS.normal, () => {
      const selectedPollId = 4;
      const selectChoice = cy.get('[data-testid="single-select"]');

      selectChoice.first().click();

      // click on option
      cy.get('[data-testid="single-select-option-Yes"]').first().click();

      const buttonsVote = cy.get('[data-testid="button-add-vote-to-ballot"]');

      // Click the button
      buttonsVote.first().should('not.be.disabled');

      buttonsVote.first().click();

      // Check the ballot count has increased
      cy.contains(/(1 of 2 available polls added to ballot)/).should('be.visible');

      // Click on the navigate
      cy.contains('Review & Submit Your Ballot').click();

      cy.location('pathname').should('eq', '/polling/review');

      // Poll card should display poll IDs
      cy.contains(`Poll ID ${selectedPollId}`).should('be.visible');

      // It can edit a choice
      cy.get('[data-testid="edit-poll-choice"]').click();

      // Opens the select
      cy.get('[data-testid="single-select"]').first().click();

      // Clicks on "No"
      cy.get('[data-testid="single-select-option-No"]').click({ force: true });

      // Clicks on update vote
      cy.contains('Update vote').click();

      // Move to submit ballot screen
      cy.get('[data-testid="submit-ballot-button"]').click();

      cy.contains('Gasless voting via Arbitrum').should('be.visible');

      // Switch to legacy voting for this test
      cy.get('[data-testid="switch-to-legacy-voting-button"]').click();

      cy.contains(
        'Submit your vote by creating a transaction and sending it to the polling contract on Ethereum Mainnet.'
      ).should('be.visible');

      // Click legacy voting submit button
      cy.get('[data-testid="submit-ballot-legacy-button"]').click();

      cy.contains('Please use your wallet to sign').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      cy.contains('Share all your votes').should('be.visible');

      // After finishing voting, there should be a message with the sharing info
      cy.contains(
        'Share your votes to the Forum or Twitter below, or go back to the polls page to edit your votes'
      ).should('be.visible');

      // And the same ammount of poll cards
      cy.get('[data-testid="poll-overview-card"]').its('length').should('be.gte', 1);
    });
  });

  it('Adds polls to review and navigates to review page and votes with the gasless system', () => {
    // Ensure the relay balance is always funded for the purpose of this test
    cy.intercept('api/polling/precheck*', {
      statusCode: 201,
      body: mockRelayRes
    });
    visitPage('/polling');

    setAccount(TEST_ACCOUNTS.hardhatOwned, () => {
      const selectedPollId = 48;
      const selectChoice = cy.get('[data-testid="single-select"]');

      selectChoice.first().click();

      // click on option
      cy.get('[data-testid="single-select-option-Yes"]').first().click();

      const buttonsVote = cy.get('[data-testid="button-add-vote-to-ballot"]');

      // Click the button
      buttonsVote.first().should('not.be.disabled');

      buttonsVote.first().click();

      // Check the ballot count has increased
      cy.contains(/(1 of 2 available polls added to ballot)/).should('be.visible');

      // Click on the navigate
      cy.contains('Review & Submit Your Ballot').click();

      cy.location('pathname').should('eq', '/polling/review');

      // Poll card should display poll IDs
      cy.contains(`Poll ID ${selectedPollId}`).should('be.visible');

      // It can edit a choice
      cy.get('[data-testid="edit-poll-choice"]').click();

      // Opens the select
      cy.get('[data-testid="single-select"]').first().click();

      // Clicks on "No"
      cy.get('[data-testid="single-select-option-No"]').click({ force: true });

      // Clicks on update vote
      cy.contains('Update vote').click();

      // Move to submit ballot screen
      cy.get('[data-testid="submit-ballot-button"]').click();

      cy.contains('Gasless voting via Arbitrum').should('be.visible');

      // Switch to legacy voting for this test
      cy.get('[data-testid="submit-ballot-gasless-button"]').click();

      cy.contains('Please use your wallet to sign').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      cy.contains('Share all your votes').should('be.visible');

      // After finishing voting, there should be a message with the sharing info
      cy.contains(
        'Share your votes to the Forum or Twitter below, or go back to the polls page to edit your votes'
      ).should('be.visible');

      // Since this is a gasless vote, it should link to arbiscan
      cy.contains('View on Arbiscan').should('be.visible');

      // And the same ammount of poll cards
      cy.get('[data-testid="poll-overview-card"]').its('length').should('be.gte', 1);
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
      cy.contains('Your ballot is empty. Go back to the polling page to add votes to your ballot.').should(
        'be.visible'
      );
    });
  });

  it('Adds comments', () => {
    visitPage('/polling');

    setAccount(TEST_ACCOUNTS.normal, () => {
      const selectChoice = cy.get('[data-testid="single-select"]');

      // Use 2nd element because the first is unreliable due to a hash/slug clash with another poll
      selectChoice.eq(0).click();

      // click on option
      cy.get('[data-testid="single-select-option-Yes"]').eq(0).click();

      const buttonsVote = cy.get('[data-testid="button-add-vote-to-ballot"]');

      // Click the button
      buttonsVote.eq(0).should('not.be.disabled');

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

      // Switch to legacy voting for this test
      cy.get('[data-testid="switch-to-legacy-voting-button"]').click();

      cy.contains(
        'Submit your vote by creating a transaction and sending it to the polling contract on Ethereum Mainnet.'
      ).should('be.visible');

      // Click legacy voting submit button
      cy.get('[data-testid="submit-ballot-legacy-button"]').click();

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
            cy.get('[data-testid="tab-Comments"]').click();

            // Checks the comment exists
            cy.contains(commentText).should('be.visible');
          });
        });
    });
  });

  // TODO: this test will fail because we only have one poll in the docker image, re-enable after adding a 2nd poll
  it('Adds multiple comments', () => {
    const comment1Text = `Multiple comments #1 - e2e suite - ${Date.now()}`;
    const comment2Text = `Multiple comments #2 - e2e suite - ${Date.now()}`;
    const comment3Text = `Multiple comments #3 - e2e suite - ${Date.now()}`;

    visitPage('/polling');

    setAccount(getTestAccountByIndex(3), () => {
      // Vote on first (use 2nd element because the first is unreliable due to a hash/slug clash with another poll)
      cy.get('[data-testid="single-select"]').eq(0).click();
      cy.get('[data-testid="single-select-option-Yes"]').eq(0).click();

      // Vote on second (use 3rd element)
      cy.get('[data-testid="single-select"]').eq(1).click();
      cy.get('[data-testid="single-select-option-No"]').eq(1).click();

      // Add votes to ballot
      // Each time we click one, it dissapears, so we need to click the second element again
      cy.get('[data-testid="button-add-vote-to-ballot"]').eq(0).click();

      cy.get('[data-testid="button-add-vote-to-ballot"]').eq(0).click();

      // Check ballot votes added to ballot
      cy.contains(/2 of 2 available polls added to ballot/).should('be.visible');

      // Goes to the review page
      // Click on the navigate
      cy.contains('Review & Submit Your Ballot').click();

      cy.location('pathname').should('eq', '/polling/review');

      // Comment on each box
      cy.get('[data-testid="poll-comment-box"]').eq(0).type(comment1Text);
      cy.get('[data-testid="poll-comment-box"]').eq(1).type(comment2Text);

      // The sign comments button should be visible
      cy.get('[data-testid="sign-comments-button"]').should('be.enabled');

      // The sign transacation button should be disabld
      cy.get('[data-testid="submit-ballot-button"]').should('be.disabled');

      // Sign comments
      cy.get('[data-testid="sign-comments-button"]').click();

      // The sign transacation button should be enabled
      cy.get('[data-testid="submit-ballot-button"]').should('be.enabled');

      cy.get('[data-testid="submit-ballot-button"]').click();

      // Switch to legacy voting for this test
      cy.get('[data-testid="switch-to-legacy-voting-button"]').click();

      cy.contains(
        'Submit your vote by creating a transaction and sending it to the polling contract on Ethereum Mainnet.'
      ).should('be.visible');

      // Click legacy voting submit button
      cy.get('[data-testid="submit-ballot-legacy-button"]').click();

      // Expect to see the previously voted polls
      cy.get('[data-testid="previously-voted-on"]').should('be.visible');

      // Get the links

      cy.get('[data-testid="previously-voted-on"]')
        .eq(0)
        .find('a')
        .first()
        .invoke('attr', 'href')
        .then(hrefComment1 => {
          cy.get('[data-testid="previously-voted-on"]')
            .eq(1)
            .find('a')
            .first()
            .invoke('attr', 'href')
            .then(hrefComment2 => {
              visitPage(hrefComment1 as string, true);

              setAccount(TEST_ACCOUNTS.normal, () => {
                // Opens the comment tab
                cy.get('[data-testid="tab-Comments"]').click();

                // Checks the comment exists
                cy.contains(comment1Text).should('be.visible');

                visitPage(hrefComment2 as string, true);

                setAccount(TEST_ACCOUNTS.normal, () => {
                  cy.get('[data-testid="tab-Comments"]').click();

                  // Checks the comment exists
                  cy.contains(comment2Text).should('be.visible');
                });
              });
            });
        });
    });
  });

  // TODO: Test in mobile with the mobile ballot layout

  // TODO: Test updating a vote that you previouslt voted on

  // TODO: Test chaning to another wallet and see the previous votes dissapear.

  // TODO: See "You have not voted" change on previously voted polls.
});
