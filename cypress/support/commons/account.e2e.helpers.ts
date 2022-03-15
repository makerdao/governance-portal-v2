import { closeModal } from '.';

// Functions that interact with the account box on the top of the page
export function clickConnectAccountButton() {
  cy.get('[aria-label="Connect wallet"]').click();
}

// Checks that the address on the account modal is equal to this text
export function modalAddressEquals(address: string | RegExp) {
  // Opens modal
  clickConnectAccountButton();

  cy.get('[data-testid="current-wallet"]').contains(address);

  closeModal();
}

// Checks that the polling weight amount on the modal equals this value
export function modalPollingWeightEquals(value: string) {
  // Opens modal
  clickConnectAccountButton();

  cy.get('[data-testid="polling-voting-weight"]').contains(value);

  closeModal();
}
