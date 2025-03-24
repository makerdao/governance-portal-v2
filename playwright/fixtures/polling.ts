import { expect, Page } from '@playwright/test';

export class PollingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/polling');
  }

  async waitForPolls() {
    await expect(this.page.getByRole('heading', { name: /Active Polls|Ended Polls/ })).toBeVisible();
  }

  async selectChoice(choice: 'Yes' | 'No') {
    const selectChoice = this.page.locator('[data-testid="single-select"]');
    await selectChoice.first().click();
    await this.page.locator(`[data-testid="single-select-option-${choice}"]`).first().click();
  }

  async addToBallot() {
    const buttonsVote = this.page.locator('[data-testid="button-add-vote-to-ballot"]');
    await expect(buttonsVote.first()).toBeEnabled();
    await buttonsVote.first().click();
    await expect(this.page.locator('text=/1 of .* available poll(s)? added to ballot/')).toBeVisible();
  }

  async navigateToReview() {
    await this.page.locator('text=Review & Submit Your Ballot').click();
    await expect(this.page).toHaveURL('/polling/review');
  }

  async verifyPollId(pollId: number) {
    await expect(this.page.locator(`text=Poll ID ${pollId}`)).toBeVisible();
  }

  async editChoice(choice: 'Yes' | 'No') {
    await this.page.locator('[data-testid="edit-poll-choice"]').click();
    const selectChoice = this.page.locator('[data-testid="single-select"]');
    await selectChoice.first().click();
    await this.page.locator(`[data-testid="single-select-option-${choice}"]`).click({ force: true });
    await this.page.locator('text=Update vote').click();
  }

  async submitBallot() {
    await this.page.locator('[data-testid="submit-ballot-button"]').click();
    await expect(this.page.locator('text=Gasless voting via Arbitrum')).toBeVisible();
  }

  async switchToLegacyVoting() {
    await this.page.locator('[data-testid="switch-to-legacy-voting-button"]').click();
    await expect(
      this.page.locator(
        'text=Submit your vote by creating a transaction and sending it to the polling contract on Ethereum Mainnet.'
      )
    ).toBeVisible();
  }

  async submitLegacyVote() {
    await this.page.locator('[data-testid="submit-ballot-legacy-button"]').click();
    await expect(this.page.locator('text=Please use your wallet to sign')).toBeVisible();
    await expect(this.page.locator('text=Share all your votes')).toBeVisible();
  }

  async verifyVoteSubmission() {
    await expect(
      this.page.locator(
        'text=Share your votes to the Forum or Twitter below, or go back to the polls page to edit your votes'
      )
    ).toBeVisible();
    await expect(this.page.locator('[data-testid="poll-overview-card"]')).toHaveCount(1);
  }
}
