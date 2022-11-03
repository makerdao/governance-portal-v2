import { TestAccount } from '../types/TestAccount';

export function visitPage(page: string, ignoreCookies?: boolean) {
  cy.visit(`${page}?network=goerlifork`, {
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
    if (!('setAccount' in win)) return;
    (win as any).setAccount(account.address, account.key);
    cy.get('[data-testid="active-network-name"]').contains(/GoerliFork/i);
    cb();
  });
}

export function closeModal() {
  cy.get('[aria-label="close"]').click();
}

// Fork to a new block
export function forkNetwork() {
  cy.exec('npx hardhat run scripts/forkGoerliNetwork.js --network goerli')
    // Must refund accounts after forking
    .exec('yarn fund');
  cy.exec('npx hardhat run scripts/forkarbTestnetNetwork.js --network arbTestnet');
}

export function fundAccounts(): void {
  cy.exec('yarn fund');
}

export function resetDatabase(): void {
  cy.exec('docker exec postgres-vulcan2x-arbitrum pg_restore -U user -d database gpdb.tar -c').exec(
    'docker restart spock-test-container'
  );
}
