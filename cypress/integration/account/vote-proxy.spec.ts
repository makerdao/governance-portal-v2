/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

import { modalAddressEquals, modalPollingWeightEquals } from '../../support/commons/account.e2e.helpers';
import { getTestAccount, getTestAccountByIndex, TEST_ACCOUNTS } from '../../support/constants/testaccounts';
import { elementContainsText, forkNetwork, setAccount, visitPage } from '../../support/commons';
import { formatAddress } from '../../../lib/utils';
import { INIT_BLOCK, VOTE_PROXY_BLOCK } from 'cypress/support/constants/blockNumbers';

describe('Vote Proxy', () => {
  const hotAddress = TEST_ACCOUNTS.voteProxyHot.address;
  const coldAddress = TEST_ACCOUNTS.voteProxyCold.address;

  before(() => {
    forkNetwork(VOTE_PROXY_BLOCK);
  });

  xit('should navigate to the address page and see the correct address', () => {
    // TODO: use a function fetch the balance if it ever changes
    const expectedBalance = '40.0';

    // Start from the hot address page and check the balance
    visitPage(`address/${hotAddress}`);

    setAccount(TEST_ACCOUNTS.voteProxyHot, () => {
      cy.contains(hotAddress.substring(0, 7).toLowerCase()).should('be.visible');
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-testid="Total MKR Balance-stat-box"]').click();
      cy.get('[data-testid="Total MKR Balance-stat-box"]').should('have.text', expectedBalance);
      /* ==== End Cypress Studio ==== */
    });

    // Navigate to cold address page and make sure it's the same
    visitPage(`address/${coldAddress}`, true);

    setAccount(TEST_ACCOUNTS.voteProxyCold, () => {
      cy.contains(coldAddress.substring(0, 7).toLowerCase()).should('be.visible');
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-testid="Total MKR Balance-stat-box"]').click();
      cy.get('[data-testid="Total MKR Balance-stat-box"]').should('have.text', expectedBalance);
      /* ==== End Cypress Studio ==== */
    });
  });

  it('should verify executive page displays same data for proxies', () => {
    // TODO: use a function fetch the balance if it ever changes
    const initialChiefBalance = '5.0';
    const initialHatSupport = '225.22';

    visitPage(`executive`);

    // Start with the cold address page
    setAccount(TEST_ACCOUNTS.voteProxyCold, () => {
      // Check balance locked in chief by the vote proxy
      cy.get('[data-testid="locked-mkr"]').should('have.text', '5.0 MKR');

      // Cold wallet can deposit into chief
      cy.get('[data-testid="deposit-button"]').click();
      cy.get('[data-testid="mkr-input"]').clear();
      cy.get('[data-testid="mkr-input"]').type('1');
      cy.get('[data-testid="button-deposit-mkr"]').click(); //fix naming

      //?? Also check here votes for exec so it can be used after withdraw

      cy.get('[data-testid="mkr-supporting"]')
        .first()
        .should('have.text', `${initialHatSupport} MKR Supporting`);
    });

    setAccount(TEST_ACCOUNTS.voteProxyHot, () => {
      // Hot account should have the new MKR balance in chief displayed "+ 1"
      cy.get('[data-testid="locked-mkr"]').should('have.text', `6.0 MKR`);

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
      cy.get('[data-testid="button-mkr-withdraw"]').click();

      // Check the UI shows the amount withdrawn from chief correctly
      cy.get('[data-testid="locked-mkr"]').should('have.text', '4.0 MKR');

      // Check the value of the MKR supporting on the exec we're not yet voting for
      cy.get('[data-testid="mkr-supporting"]').eq(1).should('have.text', '1,132.03 MKR Supporting');
      cy.get('[data-testid="proposal-status"]')
        .eq(1)
        .should('have.text', '98,867.974 additional MKR support needed to pass. Expires at .');

      // Check the value of the MKR supporting on the exec we are currently voting for
      cy.get('[data-testid="mkr-supporting"]').eq(0).should('have.text', '1,132.03 MKR Supporting');
      cy.get('[data-testid="proposal-status"]')
        .eq(0)
        .should('have.text', '99,774.775 additional MKR support needed to pass. Expires at .');

      // Vote on the new exec
      cy.get('[data-testid="vote-button-exec-overview-card"]').first().click();
      cy.get('[data-testid="vote-modal-vote-btn"]').click();
      cy.get('[data-testid="txfinal-btn"]').click();

      // Check that all the data changed by the correct amount after voting
      // Old vote
      cy.get('[data-testid="mkr-supporting"]', { timeout: 60000 })
        .eq(1)
        .should('have.text', `1,127.03 MKR Supporting`);
      cy.get('[data-testid="proposal-status"]')
        .eq(1)
        .should('have.text', '98,872.974 additional MKR support needed to pass. Expires at .');

      // New vote
      cy.get('[data-testid="mkr-supporting"]').eq(0).should('have.text', `229.22 MKR Supporting`);

      cy.get('[data-testid="proposal-status"]')
        .eq(0)
        .should('have.text', '99,770.775 additional MKR support needed to pass. Expires at .');
    });
  });
});
