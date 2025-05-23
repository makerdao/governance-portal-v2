import { expect, Page } from '@playwright/test';
import { closeModal } from '../shared';

export class ExecutivePage {
  readonly page: Page;

  // Locators
  private votingContractText: any;
  private depositButton: any;
  private depositApproveButton: any;
  private confirmTransactionText: any;
  private depositIntoContractText: any;
  private skyInput: any;
  private depositSkyButton: any;
  private transactionSuccessfulText: any;
  private lockedSky: any;
  private voteButton: any;
  private voteModalButton: any;
  private transactionSentText: any;

  constructor(page: Page) {
    this.page = page;
    this.initializeLocators();
  }

  private initializeLocators() {
    this.votingContractText = this.page.locator('text=/voting weight/');
    this.depositButton = this.page.locator('[data-testid="deposit-button"]');
    this.depositApproveButton = this.page.locator('[data-testid="deposit-approve-button"]');
    this.confirmTransactionText = this.page.locator('text=/Confirm Transaction/');
    this.depositIntoContractText = this.page.locator('text=/Deposit into voting contract/');
    this.skyInput = this.page.locator('[data-testid="sky-input"]');
    this.depositSkyButton = this.page.locator('[data-testid="button-deposit-sky"]');
    this.transactionSuccessfulText = this.page.locator('text=/Transaction Successful/');
    this.lockedSky = this.page.locator('[data-testid="locked-sky"]');
    this.voteButton = this.page.locator('[data-testid="vote-button-exec-overview-card"]');
    this.voteModalButton = this.page.locator('[data-testid="vote-modal-vote-btn"]');
    this.transactionSentText = this.page.locator('text=/Transaction Sent/');
  }

  async goto() {
    await this.page.goto('/executive');
  }

  async verifyVotingContract() {
    await expect(this.votingContractText).toBeVisible();
  }

  async depositIntoChief() {
    await this.depositButton.click();
    await this.depositApproveButton.click();
    await expect(this.confirmTransactionText).toBeVisible();
  }

  async depositSky(amount: string) {
    await expect(this.depositIntoContractText).toBeVisible();
    await this.skyInput.fill(amount);
    await this.depositSkyButton.click();
    await expect(this.confirmTransactionText).toBeVisible();
    await expect(this.transactionSuccessfulText).toBeVisible();
    closeModal(this.page);
  }

  async verifyLockedSky(amount: string) {
    await expect(this.lockedSky).toHaveText(`${amount} SKY`);
  }

  async vote() {
    await this.voteButton.first().click();
    await this.voteModalButton.click();
    await expect(this.transactionSentText).toBeVisible();
  }
}
