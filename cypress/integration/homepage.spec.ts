/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { modalAddressEquals, modalPollingWeightEquals } from '../support/commons/account.e2e.helpers';
import { getTestAccountByIndex, TEST_ACCOUNTS } from '../support/constants/testaccounts';
import { elementContainsText, forkNetwork, setAccount, visitPage } from '../support/commons';
import { formatAddress } from '../../lib/utils';
import { INIT_BLOCK } from 'cypress/support/constants/blockNumbers';
import { TESTING_ACTIVE_POLLS_COUNT } from 'cypress/support/constants/polling';
import {
  TESTING_RECOGNIZED_DELEGATE_COUNT,
  TESTING_SHADOW_DELEGATE_COUNT,
  TESTING_MKR_DELEGATED_AMOUNT
} from 'cypress/support/constants/delegates';
import {
  TESTING_ACTIVE_EXECUTIVES_COUNT,
  TESTING_MKR_ON_HAT_AMOUNT,
  TESTING_MKR_IN_CHIEF_AMOUNT
} from 'cypress/support/constants/executives';
import BigNumber from 'bignumber.js';

describe('Home Page', () => {
  before(() => {
    forkNetwork(INIT_BLOCK);
  });

  it('should find the correct data on the landing page', () => {
    // Start from the index page before connecting
    visitPage('/');

    // Find the title
    cy.get('h1').contains('Maker Governance');

    setAccount(TEST_ACCOUNTS.normal, () => {
      // Check the header badges are correct
      cy.get('a').contains('Polling').next().contains(TESTING_ACTIVE_POLLS_COUNT.toString());
      cy.get('a').contains('Executive').next().contains(TESTING_ACTIVE_EXECUTIVES_COUNT.toString());

      // Find the Governance Stats block
      cy.contains('Governance Stats').should('be.visible');

      elementContainsText('[data-testid="MKR on Hat"]', new BigNumber(TESTING_MKR_ON_HAT_AMOUNT).toFormat(0));
      elementContainsText('[data-testid="Active Polls"]', TESTING_ACTIVE_POLLS_COUNT.toString());
      elementContainsText(
        '[data-testid="Recognized Delegates"]',
        TESTING_RECOGNIZED_DELEGATE_COUNT.toString()
      );
      elementContainsText('[data-testid="Shadow Delegates"]', TESTING_SHADOW_DELEGATE_COUNT.toString());
      elementContainsText(
        '[data-testid="MKR Delegated"]',
        `${new BigNumber(TESTING_MKR_DELEGATED_AMOUNT).toFormat(0)} MKR`
      );
      elementContainsText(
        '[data-testid="MKR in Chief"]',
        `${new BigNumber(TESTING_MKR_IN_CHIEF_AMOUNT).toFormat(0)} MKR`
      );

      // TODO add more specific tests to below sections

      // Find the Active Polls block
      cy.contains('Active Polls').should('be.visible');

      cy.get('[data-testid="poll-overview-card"]').its('length').should('be.eq', TESTING_ACTIVE_POLLS_COUNT);

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

      // Checks that there are enough delegates
      // TODO enable this once we have recognized delegates in the db
      cy.get('[data-testid="top-recognized-delegate"]')
        .its('length')
        .should('be.eq', TESTING_RECOGNIZED_DELEGATE_COUNT);

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
        // cy.screenshot('test');
      });
    });
  });
});
