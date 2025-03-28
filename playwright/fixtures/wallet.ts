import { Page, Locator, expect } from '@playwright/test';

export class WalletPage {
  readonly page: Page;

  readonly connectWalletButton: Locator;
  readonly connectedAddress: Locator;
  readonly connectedStatus: Locator;
  readonly changeWalletButton: Locator;
  readonly closeButton: Locator;
  readonly mockWalletButton: Locator;
  readonly backButton: Locator;
  readonly mockConnectorText: Locator;
  readonly viewAccountPageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.connectWalletButton = this.page.getByRole('button', { name: 'Connect wallet' });
    this.connectedAddress = this.page.getByTestId('connected-address');
    this.connectedStatus = this.page.getByText('Connected with Mock Connector').first();
    this.changeWalletButton = this.page.getByTestId('wallet-change-button');
    this.closeButton = this.page.getByTestId('wallet-modal-close-button');
    this.mockWalletButton = this.page.getByTestId('select-wallet-mock');
    this.backButton = this.page.getByRole('button', { name: 'Back' });
    this.mockConnectorText = this.page.getByText('Mock Connector');
    this.viewAccountPageButton = this.page.getByTestId('view-account-page-button');
  }

  async clickConnectWallet() {
    await this.connectWalletButton.click();
  }

  async waitForConnection() {
    try {
      await expect(this.connectedStatus).toBeVisible();
      await this.closeModal();
    } catch (error) {
      await this.mockWalletButton.click();
    }
  }

  async getConnectedStatus() {
    return this.connectedStatus;
  }

  async clickChangeWallet() {
    await expect(this.changeWalletButton).toBeVisible();
    await this.changeWalletButton.click();
  }

  async openWalletModal() {
    await expect(this.connectedAddress).toBeVisible();
    await this.connectedAddress.click();
  }

  async verifyWalletModal() {
    await expect(this.connectedStatus).toBeVisible();
  }

  async verifyWalletSelectionModal() {
    await expect(this.mockConnectorText).toBeVisible();
    await expect(this.mockWalletButton).toBeVisible();
    await expect(this.mockWalletButton).toBeDisabled();
  }

  async clickBackButton() {
    await expect(this.backButton).toBeVisible();
    await this.backButton.click();
  }

  async closeModal() {
    await expect(this.closeButton).toBeVisible();
    await this.closeButton.click();
  }

  async clickViewAccountPage() {
    await expect(this.viewAccountPageButton).toBeVisible();
    await this.viewAccountPageButton.click();
  }
}
