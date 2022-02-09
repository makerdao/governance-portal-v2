import { TestAccount } from '../types/TestAccount';

export function visitPage(page: string, ignoreCookies?: boolean) {
  cy.visit(`http://localhost:3000${page}?network=goerlifork`, {
    onBeforeLoad: win => {
      // If an account is sent, connect with that one
    }
  }).then(() => {
    if (!ignoreCookies) {
      cy.contains('Accept configured cookies').click();
    }
  });
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

export async function setAccount(account: TestAccount, cb: () => void) {
  cy.window().then(win => {
    (win as any).setAccount(account.address, account.key);
    cy.get('[data-testid="active-network-name"]').contains(/goerlifork/i);
    cb();
  });
}

export function closeModal() {
  cy.get('[aria-label="close"]').click();
}
