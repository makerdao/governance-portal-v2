/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { modalAddressEquals, modalPollingWeightEquals } from '../support/commons/account.e2e.helpers';
import { getTestAccount, getTestAccountByIndex, TEST_ACCOUNTS } from '../support/constants/testaccounts';
import { elementContainsText, forkNetwork, setAccount, visitPage } from '../support/commons';
import { formatAddress } from '../../lib/utils';
import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';

describe('Home Page', () => {
  before(() => {
    forkNetwork(INIT_BLOCK);
  });

  it('should find the correct data on the landing page', () => {
    const expectedActivePolls = 4;

    // Start from the index page before connecting
    visitPage('/');

    // Find the title
    cy.get('h1').contains('Maker Governance');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Check the header badges are correct
      cy.get('a').contains('Polling').next().contains('21');
      cy.get('a').contains('Executive').next().contains('2');

      // Find the Governance Stats block
      cy.contains('Governance Stats').should('be.visible');

      elementContainsText('[data-testid="MKR on Hat"]', '100,000');
      elementContainsText('[data-testid="Active Polls"]', '21');
      elementContainsText('[data-testid="Recognized Delegates"]', '2');
      elementContainsText('[data-testid="Shadow Delegates"]', '15');
      elementContainsText('[data-testid="MKR Delegated"]', '1,279 MKR');
      elementContainsText('[data-testid="MKR in Chief"]', '201,312 MKR');

      // TODO add more specific tests to below sections

      // Find the Active Polls block
      cy.contains('Active Polls').should('be.visible');

      cy.get('[data-testid="poll-overview-card"]').its('length').should('be.eq', expectedActivePolls);

      // Find the Meet the Delegates block
      cy.contains('Meet the Delegates').should('be.visible');

      // Find the Top Recognized Delegates block
      cy.contains('Top Recognized Delegates').should('be.visible');

      // Find the How to participate block
      cy.contains('How to participate in Maker Governance').should('be.visible');

      // Find the Resources block
      cy.contains('Resources').should('be.visible');

      // Find the Follow the Conversation and Participate block
      cy.contains('Follow the Conversation and Participate').should('be.visible');
      cy.contains('Governance Participation').should('be.visible');
      cy.contains('Top Voters').should('be.visible');

      //TODO test footer stuff

      // Change account and verify the account box updates
      const newAccount = getTestAccountByIndex(4);

      setAccount(newAccount, () => {
        // Should find the connected
        const regex = new RegExp(formatAddress(newAccount.address), 'i');
        cy.contains(regex).should('be.visible');

        // Opens modal connection and finds 5 MKR
        //click on account modal
        modalAddressEquals(regex);

        modalPollingWeightEquals('0.01 MKR');

        // Save screenshot
        cy.screenshot('test');
      });
    });
  });
});
