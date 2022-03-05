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

    // Start from the hot address page and check the balance
    visitPage(`executive`);

    setAccount(TEST_ACCOUNTS.voteProxyCold, () => {
      // cy.contains(coldAddress.substring(0, 7).toLowerCase()).should('be.visible');
      /* ==== Generated with Cypress Studio ==== */
      // cy.get('[data-testid="locked-mkr"]').click();
      cy.get('[data-testid="locked-mkr"]').should('have.text', '5.0 MKR');
      /* ==== End Cypress Studio ==== */

      // Also check here votes for exec so it can be used after withdraw
      //TODO add data-testid here
      /* ==== Generated with Cypress Studio ==== */
      // cy.get(
      //   '.css-1y1c6xw-ExecutiveOverviewCard > .css-2aebet > .css-p40j8a-ExecutiveOverviewCard > .css-17yi0lh > .css-fqvj5z-ExecutiveOverviewCard > .css-9k4top-ExecutiveOverviewCard'
      // ).click();

      cy.get('[data-testid="mkr-supporting"]')
        .first()
        .should('have.text', `${initialHatSupport} MKR Supporting`);

      // cy.get(
      //   '.css-1y1c6xw-ExecutiveOverviewCard > .css-2aebet > .css-p40j8a-ExecutiveOverviewCard > .css-17yi0lh > .css-fqvj5z-ExecutiveOverviewCard > .css-9k4top-ExecutiveOverviewCard'
      // ).should('have.text', `${initialHatSupport} MKR Supporting`);
      /* ==== End Cypress Studio ==== */
    });

    setAccount(TEST_ACCOUNTS.voteProxyHot, () => {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-testid="locked-mkr"]').click();
      cy.get('[data-testid="locked-mkr"]').should('have.text', `${initialChiefBalance} MKR`);
      cy.get('[data-testid="withdraw-button"]').click();
      cy.get('[data-testid="mkr-input"]').clear();
      cy.get('[data-testid="mkr-input"]').type('1');
      cy.get('[data-testid="button-mkr-withdraw"]').click();
      cy.get('[data-testid="locked-mkr"]').click();
      cy.get('[data-testid="locked-mkr"]').should('have.text', '4.0 MKR');
      /* ==== End Cypress Studio ==== */

      // cy.get('[data-testid="proposal-status"]').eq(1)

      // Check the new votes for poll has gone down by X (not working right now, badge not mutating??)
      // cy.get(
      //   '.css-1y1c6xw-ExecutiveOverviewCard > .css-2aebet > .css-p40j8a-ExecutiveOverviewCard > .css-17yi0lh > .css-fqvj5z-ExecutiveOverviewCard > .css-9k4top-ExecutiveOverviewCard'
      // ).should('have.text', `${parseFloat(initialHatSupport) - 1} MKR Supporting`);

      // Check the new poll votes before voting
      cy.get('[data-testid="mkr-supporting"]').eq(1).should('have.text', '1,132.03 MKR Supporting');

      cy.get('[data-testid="proposal-status"]')
        .eq(1)
        .should('have.text', '98,867.974 additional MKR support needed to pass. Expires at .');

      cy.get('[data-testid="proposal-status"]')
        .eq(0)
        .should('have.text', '99,774.775 additional MKR support needed to pass. Expires at .');

      //vote on it
      // cy.get('.css-1176iuf-DefaultVoteModalView').click();
      // cy.get('.css-1nmooyx-TxFinal').click();

      // check that it also changed
      cy.get('[data-testid="proposal-status"]')
        .eq(1)
        .should('have.text', '98,867.974 additional MKR support needed to pass. Expires at .');

      cy.get('[data-testid="proposal-status"]')
        .eq(0)
        .should('have.text', '99,774.775 additional MKR support needed to pass. Expires at .');

      // click deposit
      // notice alert pops up
      cy.on('window:alert', txt => {
        assert.equal(
          txt,
          'You are using the hot wallet for a voting proxy. You can only deposit from the cold wallet. Switch to that wallet to continue. to equal'
        );
      });
      cy.get('[data-testid="deposit-button"]').click();
    });

    // setAccount(TEST_ACCOUNTS.voteProxyCold, () => {
    //   cy.get('[data-testid="locked-mkr"]').should('have.text', '4.0 MKR');
    //   // deposit more into chief and verify

    // });
  });
});

//TODO for the exec test, voting is not workign so the numbers are off, fix vote & the numbers
