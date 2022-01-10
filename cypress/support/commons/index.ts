import { TestAccount } from '../types/TestAccount';

export function visitPage(page: string) {
  cy.visit(`http://localhost:3000${page}?network=testnet`, {
    onBeforeLoad: win => {
      win.__TESTCHAIN__ = true;
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
    console.log(account, 'eeeeeeee', win.setAccount)
    win.setAccount(account.address, account.key);
    cb();
  });
}
