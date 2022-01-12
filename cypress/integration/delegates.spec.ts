/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { sendETH, sendMKR } from 'cypress/support/commons/token.helpers';
import { getTestAccount } from 'cypress/support/constants/testaccounts';
import { formatAddress } from 'lib/utils';
import { closeModal,  setAccount, visitPage } from '../support/commons';

describe('Delegates Page', () => {
  it('should navigate to the delegates page and find a list of delegates', () => {
    // Start from the index page
    visitPage('/delegates');

    // Find the shadow delegates
    cy.contains('Shadow Delegates').should('be.visible');

    // Shoudl find various delegates
    cy.get('[data-testid="delegate-card"]').should('have.length', 9);
  });

  it('Should find the delegates system info', () => {
    visitPage('/delegates');
    
    // Checks the total amount of delegates
    cy.get('[data-testid="total-delegates-system-info"]').contains('9')
    cy.get('[data-testid="total-recognized-delegates-system-info"]').contains('0')
    cy.get('[data-testid="total-shadow-delegates-system-info"]').contains('9')
    cy.get('[data-testid="total-mkr-system-info"]').contains('821.18')

  })

  it('Should hide shadow delegates when unchecking the filter', () => {
    visitPage('/delegates');

    cy.get('[data-testid="delegate-type-filter"]').click();

    cy.get('[data-testid="delegate-type-filter-show-recognized"]').click();

     // See now 0 delegates
     cy.get('[data-testid="delegate-card"]').should('have.length', 0);

    // Reset filters
     cy.get('[data-testid="delegate-reset-filters"]').click();

     // Now see al the delegates again
     cy.get('[data-testid="delegate-card"]').should('have.length', 9);

     
  });

  it('Connects wallet and clicks on delegate', () => {
    // Start from the index page
    visitPage('/delegates');

    const newAccount = getTestAccount();

    sendMKR(newAccount.address, 0.5);
    sendETH(newAccount.address, 0.5);

    setAccount(newAccount, () => {
      // Should find the connected
      cy.contains(formatAddress(newAccount.address)).should('be.visible');

      // Click delegate button
      cy.get('[data-testid="button-delegate"]').first().click();

      // Aprove tx
      cy.get('button').contains('Approve Delegate Contract').click();

      // Wait for tx confirmed
      cy.contains('Confirm Transaction').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      cy.contains('Deposit into delegate contract').should('be.visible');

      // Inserts the amount of MKR to delegate
      cy.get('[data-testid="mkr-input"]').type('0.5');

      // Delegate
      cy.get('button').contains('Delegate MKR').click();

      // Wait for text changing
      cy.contains('You are delegating').should('be.visible');

      // Check that the etherscan link shows the correct address
      // cy.get('a[href="https://etherscan.io/address/0xb21e535fb349e4ef0520318acfe589e174b0126b"]').should('be.visible')

      // Clicks the confirm button
      cy.get('button').contains('Confirm Transaction').click();
      // Wait for tx confirmed
      cy.contains('Confirm Transaction').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      cy.contains('Transaction Sent').should('be.visible');

      // CLose modal
      closeModal();

      // Checks that the delegated amount has appeared
      cy.get('[data-testid="mkr-delegated-by-you"]').contains('0.50');

      // Find the undelegate button
      cy.get('[data-testid="button-undelegate"]').first().click();

      // Aprove the undelegate contract
      cy.get('button').contains('Approve Delegate Contract').click();

      // Wait for tx confirmed
      cy.contains('Confirm Transaction').should('be.visible');

      cy.contains('Transaction Pending').should('be.visible');

      cy.contains('Withdraw from delegate contract').should('be.visible');

      cy.get('button[data-testid="mkr-input-set-max"]').click();

      // UnDelegate
      cy.get('button').contains('Undelegate MKR').click();
      cy.contains('Transaction Pending').should('be.visible');

      cy.contains('Transaction Sent').should('be.visible');

      // CLose modal
      closeModal();

      // Checks that the delegated amount has changed
      cy.get('[data-testid="mkr-delegated-by-you"]').contains('0.00');
    });
  });
});
