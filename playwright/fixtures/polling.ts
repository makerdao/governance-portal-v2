import { expect, Page } from '@playwright/test';

export class PollingPage {
  readonly page: Page;

  // Locators
  private pollHeading: any;
  private singleSelect: any;
  private addToBallotButton: any;
  private ballotAddedText: any;
  private reviewButton: any;
  private editPollChoiceButton: any;
  private updateVoteButton: any;
  private submitBallotButton: any;
  private gaslessVotingText: any;
  private switchToLegacyButton: any;
  private legacyVotingText: any;
  private submitLegacyButton: any;
  private signWalletText: any;
  private shareVotesText: any;
  private voteSubmissionText: any;
  private pollOverviewCard: any;
  private submitGaslessButton: any;

  constructor(page: Page) {
    this.page = page;
    this.initializeLocators();
  }

  private initializeLocators() {
    this.pollHeading = this.page.getByRole('heading', { name: /Active Polls|Ended Polls/ });
    this.singleSelect = this.page.locator('[data-testid="single-select"]');
    this.addToBallotButton = this.page.locator('[data-testid="button-add-vote-to-ballot"]');
    this.ballotAddedText = this.page.locator('text=/1 of .* available poll(s)? added to ballot/');
    this.reviewButton = this.page.locator('text=Review & Submit Your Ballot');
    this.editPollChoiceButton = this.page.locator('[data-testid="edit-poll-choice"]');
    this.updateVoteButton = this.page.locator('text=Update vote');
    this.submitBallotButton = this.page.locator('[data-testid="submit-ballot-button"]');
    this.gaslessVotingText = this.page.locator('text=Gasless voting via Arbitrum');
    this.switchToLegacyButton = this.page.locator('[data-testid="switch-to-legacy-voting-button"]');
    this.legacyVotingText = this.page.locator(
      'text=Submit your vote by creating a transaction and sending it to the polling contract on Ethereum Mainnet.'
    );
    this.submitLegacyButton = this.page.locator('[data-testid="submit-ballot-legacy-button"]');
    this.signWalletText = this.page.locator('text=Please use your wallet to sign');
    this.shareVotesText = this.page.locator('text=Share all your votes');
    this.voteSubmissionText = this.page.locator(
      'text=Share your votes to the Forum or Twitter below, or go back to the polls page to edit your votes'
    );
    this.pollOverviewCard = this.page.locator('[data-testid="poll-overview-card"]');
    this.submitGaslessButton = this.page.locator('[data-testid="submit-ballot-gasless-button"]');
  }

  private getSingleSelectOption(choice: 'Yes' | 'No') {
    return this.page.locator(`[data-testid="single-select-option-${choice}"]`);
  }

  private getPollId(pollId: number) {
    // return this.page.locator(`h5:has-text("POLL ID ${pollId}")`);
    return this.page.getByText(`Posted May 14 2025 16:00 UTC | Poll ID ${pollId}`);
  }

  async goto() {
    await this.page.goto('/polling');
  }

  async waitForPolls() {
    await expect(this.pollHeading).toBeVisible();
  }

  async selectChoice(choice: 'Yes' | 'No') {
    await this.singleSelect.first().click();
    await this.getSingleSelectOption(choice).first().click();
  }

  async addToBallot() {
    await expect(this.addToBallotButton.first()).toBeEnabled();
    await this.addToBallotButton.first().click();
    await expect(this.ballotAddedText).toBeVisible();
  }

  async navigateToReview() {
    await this.reviewButton.click();
    await expect(this.page).toHaveURL('/polling/review');
  }

  async verifyPollId(pollId: number) {
    await expect(this.getPollId(pollId)).toBeVisible();
  }

  async editChoice(choice: 'Yes' | 'No') {
    await this.editPollChoiceButton.click();
    await this.singleSelect.first().click();
    await this.getSingleSelectOption(choice).click({ force: true });
    await this.updateVoteButton.click();
  }

  async submitBallot() {
    await this.submitBallotButton.click();
    await expect(this.gaslessVotingText).toBeVisible();
  }

  async switchToLegacyVoting() {
    await this.switchToLegacyButton.click();
    await expect(this.legacyVotingText).toBeVisible();
  }

  async submitLegacyVote() {
    await this.submitLegacyButton.click();
    await expect(this.signWalletText).toBeVisible({ timeout: 10000 });
    await expect(this.shareVotesText).toBeVisible({ timeout: 10000 });
  }

  async submitGaslessVote() {
    await this.submitGaslessButton.click();
    await this.verifyVoteSubmission();
  }

  async verifyVoteSubmission() {
    await expect(this.voteSubmissionText).toBeVisible({ timeout: 10000 });
    await expect(this.pollOverviewCard).toHaveCount(1);
  }
}
