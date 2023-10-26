/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { modalAddressEquals, modalPollingWeightEquals } from '../../support/commons/account.e2e.helpers';
import { getTestAccount, getTestAccountByIndex, TEST_ACCOUNTS } from '../../support/constants/testaccounts';
import {
  elementContainsText,
  forkNetwork,
  resetDatabase,
  setAccount,
  visitPage
} from '../../support/commons';
import { formatAddress } from '../../../lib/utils';
import { INIT_BLOCK, VOTE_PROXY_BLOCK } from 'cypress/support/constants/blockNumbers';

describe('Vote Proxy', () => {
  const hotAddress = TEST_ACCOUNTS.voteProxyHot.address;
  const coldAddress = TEST_ACCOUNTS.voteProxyCold.address;

  before(() => {
    forkNetwork();
    resetDatabase();
  });

  it('should navigate to the address page and see the correct address', () => {
    const expectedBalance = '40.0';

    // Start from the hot address page and check the balance
    visitPage(`address/${hotAddress}`);

    setAccount(TEST_ACCOUNTS.voteProxyHot, () => {
      cy.contains(hotAddress.substring(0, 7).toLowerCase()).should('be.visible');
      cy.get('[data-testid="Total MKR Balance-stat-box"]').should('have.text', expectedBalance);
    });

    // Navigate to cold address page and make sure it's the same
    visitPage(`address/${coldAddress}`, true);

    setAccount(TEST_ACCOUNTS.voteProxyCold, () => {
      cy.contains(coldAddress.substring(0, 7).toLowerCase()).should('be.visible');
      cy.get('[data-testid="Total MKR Balance-stat-box"]').click();
      cy.get('[data-testid="Total MKR Balance-stat-box"]').should('have.text', expectedBalance);
    });
  });

  // this remains in effect for the remainder of the tests in the same spec file.
  Cypress.config({ defaultCommandTimeout: 90000 });

  it('should verify executive page displays correct data for cold proxy', () => {
    visitPage(`executive`);

    // Start with the cold address page
    setAccount(TEST_ACCOUNTS.voteProxyCold, () => {
      // Check balance locked in chief of the vote proxy
      cy.get('[data-testid="locked-mkr"]').should('have.text', '5.0 MKR');

      // Cold wallet can deposit into chief
      cy.get('[data-testid="deposit-button"]').click();
      cy.get('[data-testid="mkr-input"]').clear();
      cy.get('[data-testid="mkr-input"]').type('1');
      cy.get('[data-testid="button-deposit-mkr"]').click();
    });
  });

  it('should verify executive page displays correct data for hot proxy', () => {
    // Set an http intercept for fetching goerli proposals
    cy.intercept({
      method: 'GET',
      url: '/api/executive?network=goerlifork&start=0&limit=10&sortBy=active'
    }).as('getGoerliProposals');
    visitPage(`executive`, true);

    setAccount(TEST_ACCOUNTS.voteProxyHot, () => {
      // Wait until we've fetched the goerli proposals since mainnet proposals are fetched first
      cy.wait('@getGoerliProposals');

      // Hot account should have the new MKR balance in chief displayed
      cy.get('[data-testid="locked-mkr"]').should('have.text', `5.0 MKR`);

      // Hot wallet cannot deposit funds into chief
      cy.on('window:alert', txt => {
        assert.equal(
          txt,
          'You are using the hot wallet for a voting proxy. You can only deposit from the cold wallet. Switch to that wallet to continue.'
        );
      });
      cy.get('[data-testid="deposit-button"]').click();

      // But it can withdraw from chief into the cold wallet
      cy.get('[data-testid="withdraw-button"]').click();
      cy.get('[data-testid="mkr-input"]').clear();
      cy.get('[data-testid="mkr-input"]').type('2');
      cy.get('[data-testid="button-withdraw-mkr"]').click();

      // Check the UI shows the amount withdrawn from chief correctly
      cy.get('[data-testid="locked-mkr"]').should('have.text', '3.0 MKR');

      // Check the value of the MKR supporting on the exec we're not yet voting for
      cy.get('[data-testid="MKR Supporting-stat-box"]').eq(1).should('have.text', '870.68');
      cy.get('[data-testid="proposal-status"]')
        .eq(1)
        .should('have.text', '99,577 additional MKR support needed to pass. Expires at .');

      // Check the value of the MKR supporting on the exec we are currently voting for
      cy.get('[data-testid="MKR Supporting-stat-box"]').first().should('have.text', '1,056');
      cy.get('[data-testid="proposal-status"]')
        .first()
        .should('have.text', '98,944 additional MKR support needed to pass. Expires at .');

      // Vote on the new exec
      cy.get('[data-testid="vote-button-exec-overview-card"]').first().click();
      cy.get('[data-testid="vote-modal-vote-btn"]').click();
      cy.get('[data-testid="txfinal-btn"]').click();

      // Check that all the data changed by the correct amount after voting
      // Old vote
      cy.get('[data-testid="MKR Supporting-stat-box"]').eq(1).should('have.text', `421.38`);
      cy.get('[data-testid="proposal-status"]')
        .eq(1)
        .should('have.text', '99,600 additional MKR support needed to pass. Expires at .');

      // New vote
      cy.get('[data-testid="MKR Supporting-stat-box"]').first().should('have.text', `1,059`);
      cy.get('[data-testid="proposal-status"]')
        .first()
        .should('have.text', '98,941 additional MKR support needed to pass. Expires at .');
    });
  });
});

//TODO same checks but for polling page
