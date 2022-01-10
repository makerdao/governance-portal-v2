/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { TEST_ACCOUNTS } from "cypress/support/constants/testaccounts";
import { elementContainsText, setAccount, visitPage } from "../support/commons";
import { initTestchainPolls } from "../support/commons/initTestChainData";

describe('Home Page', () => {
  // beforeAll(() => {
  //   initTestchainPolls()
  // })
  
  it('should navigate to the home page page and find the title', () => {
    // Start from the index page
    visitPage('/');

    // Find the title
    elementContainsText('h1', 'Maker Governance');

    // Find the title
    cy.get('h1').contains('Maker Governance');
  });

  it('should find the stats', () => {
    // Start from the index page
    visitPage('/');

    // Find the Dai Savings Rate info
    cy.contains('Dai Savings Rate').should('be.visible');

    // Find the Polling Votes block
    cy.contains('Polling Votes').should('be.visible');
  });

  it('Connects wallet', () => {
     // Start from the index page
     visitPage('/');
    // TODO: We need to define how to connect to the accounts. 
    // With dai.js we had access to the libraries and jest mocks, but with Cypress we don't have mocks. 
    // We have to emulate a more realistic scenario
    // For that we should have a system that can load an account from the global window settings
    setAccount(TEST_ACCOUNTS.normal, () => {

      // Should find the connected 
      cy.contains('0xe8364...5248').should('be.visible')

      // Save screenshot
      cy.screenshot('test')
    })

   
  })
});
