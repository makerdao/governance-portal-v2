import { expect, Page } from '@playwright/test';
import { closeModal } from '../shared';

export class DelegatePage {
  readonly page: Page;

  // Locators
  private sortDropdown: any;
  private highestFirstOption: any;
  private delegateButton: any;
  private approveDelegateButton: any;
  private confirmTransactionButton: any;
  private confirmTransactionText: any;
  private depositText: any;
  private skyInput: any;
  private depositSkyButton: any;
  private delegatingText: any;
  private congratsText: any;
  private delegatedByYouText: any;
  private undelegateButton: any;
  private withdrawText: any;
  private setMaxButton: any;
  private undelegateSkyButton: any;
  private transactionPendingText: any;
  private transactionSentText: any;
  private undelegatingText: any;
  constructor(page: Page) {
    this.page = page;
    this.initializeLocators();
  }

  private initializeLocators() {
    this.sortDropdown = this.page.locator('[data-reach-listbox-input] [role="button"]');
    this.highestFirstOption = this.page.locator('li[role="option"]:has-text("SKY delegated: highest first")');
    this.delegateButton = this.page.locator('[data-testid="button-delegate"]:enabled');
    this.approveDelegateButton = this.page.locator('button:has-text("Approve Delegate Contract")');
    this.confirmTransactionButton = this.page.locator('button:has-text("Confirm Transaction")');
    this.confirmTransactionText = this.page.locator('text=Confirm Transaction');
    this.depositText = this.page.locator('text=Deposit into delegate contract');
    this.skyInput = this.page.locator('[data-testid="sky-input"]');
    this.depositSkyButton = this.page.locator('[data-testid="deposit-sky-modal-button"]');
    this.delegatingText = this.page.locator('text=You are delegating');
    this.congratsText = this.page.locator('text=You delegated');
    this.delegatedByYouText = this.page.locator('[data-testid="sky-delegated-by-you"]');
    this.undelegateButton = this.page.locator('[data-testid="button-undelegate"]');
    this.withdrawText = this.page.locator('text=Withdraw from delegate contract');
    this.setMaxButton = this.page.locator('button[data-testid="sky-input-set-max"]');
    this.undelegateSkyButton = this.page.locator('button:has-text("Undelegate SKY")');
    this.transactionPendingText = this.page.locator('text=Transaction Pending');
    this.transactionSentText = this.page.locator('text=Transaction Sent');
    this.undelegatingText = this.page.locator('text=Undelegating SKY');
  }

  async goto() {
    await this.page.goto('/delegates');
  }

  async sortByHighestFirst() {
    await this.sortDropdown.click();
    await this.highestFirstOption.click();
  }

  async delegate(amount: string) {
    await this.delegateButton.first().click();
    await this.approveDelegateButton.click();
    await expect(this.confirmTransactionText).toBeVisible();

    await expect(this.depositText).toBeVisible();
    await this.skyInput.fill(amount);
    await this.depositSkyButton.click();

    await expect(this.delegatingText).toBeVisible();
    await this.confirmTransactionButton.click();
    await expect(this.confirmTransactionText).toBeVisible();
    await expect(this.congratsText).toBeVisible();
    closeModal(this.page);
  }

  async verifyDelegatedAmount(amount: string) {
    await expect(this.delegatedByYouText.first()).toHaveText(amount);
  }

  async undelegateAll() {
    await this.undelegateButton.first().click();
    await expect(this.withdrawText).toBeVisible();
    await this.setMaxButton.click();
    await this.undelegateSkyButton.click();
    await expect(this.transactionPendingText).toBeVisible();
    await expect(this.undelegatingText).toBeVisible();
    closeModal(this.page);
    // await expect(this.delegatedByYouText.contains('0.000')).toBeVisible();
  }
}
