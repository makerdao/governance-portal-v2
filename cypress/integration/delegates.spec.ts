/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { modalAddressEquals, modalPollingWeightEquals } from "cypress/support/commons/account.e2e.helpers";
import { sendETH, sendMKR } from "cypress/support/commons/mkr.e2e.helpers";
import { getTestAccount, TEST_ACCOUNTS } from "cypress/support/constants/testaccounts";
import { formatAddress } from "lib/utils";
import { elementContainsText, setAccount, visitPage } from "../support/commons";

describe('Delegates Page', () => {
 
  it('should navigate to the delegates page and find a list of delegates', () => {
    // Start from the index page
    visitPage('/delegates');

    // Find the shadow delegates
    cy.contains('Shadow Delegates').should('be.visible');

    // Shoudl find various delegates
    cy.get('[data-testid="delegate-card"]').should('have.length', 18)

  });

  it('Connects wallet and clicks on delegate', () => {
      // Start from the index page
    visitPage('/delegates');

    const newAccount = getTestAccount()

    sendMKR(newAccount.address, 0.5)
    sendETH(newAccount.address, 0.1);

    setAccount(newAccount, () => {

        // Should find the connected 
        cy.contains(formatAddress(newAccount.address)).should('be.visible')
  
        // Click delegate button 
        cy.get('[data-testid="button-delegate"]').first().click();

        // Aprove tx
        cy.get('button').contains('Approve Delegate Contract').click();

        // Wait for tx confirmed 
        cy.contains('Confirm Transaction').should('be.visible')

        cy.contains('Transaction Pending').should('be.visible')

        cy.contains('Deposit into delegate contract').should('be.visible')

        // Inserts the amount of MKR to delegate
        cy.get('[data-testid="mkr-input"]').type('0.5')

        // Delegate
        cy.get('button').contains('Delegate MKR').click();
        

        // Wait for text changing
        cy.contains('You are delegating').should('be.visible');

        // Check that the etherscan link shows the correct address
        // cy.get('a[href="https://etherscan.io/address/0xb21e535fb349e4ef0520318acfe589e174b0126b"]').should('be.visible')

        // Clicks the confirm button
        cy.get('button').contains('Confirm Transaction').click();
        // Wait for tx confirmed 
        cy.contains('Confirm Transaction').should('be.visible')

        cy.contains('Transaction Pending').should('be.visible')

        cy.contains('Transaction Sent').should('be.visible')

        // CLose modal
        cy.get('[aria-label="close"]').click();

        cy.contains('0.50').should('be.visible')
      })
  
  })

});
