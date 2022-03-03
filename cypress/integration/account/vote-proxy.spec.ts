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
  before(() => {
    forkNetwork(VOTE_PROXY_BLOCK);
  });
  it('should navigate to the address page and see the correct address', () => {
    // Start from the hot address page
    visitPage(`address/${hotAddress}`);

    setAccount(TEST_ACCOUNTS.voteProxyHot, () => {
      cy.contains(hotAddress.substring(0, 7).toLowerCase()).should('be.visible');
    });
  });
});
