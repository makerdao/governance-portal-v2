import { TestAccount } from '../types/TestAccount';

export function visitPage(page: string) {
  cy.visit(`http://localhost:3000${page}?network=testnet`, {
    onBeforeLoad: win => {
      // TODO: Check if we want to preload some info on the page
     // win.__TESTCHAIN__ = true;
    }
  });
  cy.contains('Accept configured cookies').click();
}

export function elementExist(selector: string) {
  return cy.get(selector).should('be.visible');
}

export function clickElement(selector: string) {
  cy.get(selector).click();
}

export function elementContainsText(selector: string, text: string) {
  cy.get(selector).contains(text);
}

export async function setAccount(account: TestAccount, cb : () => void ) {
  cy.window().then(win => {
    win.setAccount(account.address, account.key);
    cb();
  });
}

export function closeModal() {
  cy.get('[aria-label="close"]').click();
}