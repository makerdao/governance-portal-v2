import { test, expect } from '@playwright/test';
import {connectWallet} from './shared';
import './forkVnet';

test.beforeEach(async ({ page }) => {
    await page.route('api/polling/precheck*', route => {
        route.fulfill({
          status: 201,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          contentType: 'application/json',
          body: JSON.stringify({
            recentlyUsedGaslessVoting: null,
            hasMkrRequired: true,
            alreadyVoted: false,
            relayBalance: '0.99766447864494'
          })
        });
    });
  });


test('Adds polls to review and navigates to review page and votes with the legacy system', async ({ page }) => {
    await page.goto('/polling');

    await expect(page.getByRole('heading', { name: /Active Polls|Ended Polls/ })).toBeVisible();
    
    await connectWallet(page);

    const selectedPollId = 1107;
    const selectChoice = page.locator('[data-testid="single-select"]');

    await selectChoice.first().click();

    // click on option
    await page.locator('[data-testid="single-select-option-Yes"]').first().click();

    const buttonsVote = page.locator('[data-testid="button-add-vote-to-ballot"]');

    // Click the button
    await expect(buttonsVote.first()).toBeEnabled();

    await buttonsVote.first().click();

    // Check the ballot count has increased
    await expect(page.locator('text=/1 of .* available poll(s)? added to ballot/')).toBeVisible();

    // Click on the navigate
    await page.locator('text=Review & Submit Your Ballot').click();

    await expect(page).toHaveURL('/polling/review');

    // Poll card should display poll IDs
    await expect(page.locator(`text=Poll ID ${selectedPollId}`)).toBeVisible();

    // It can edit a choice
    await page.locator('[data-testid="edit-poll-choice"]').click();

    // Opens the select
    await selectChoice.first().click();

    // Clicks on "No"
    await page.locator('[data-testid="single-select-option-No"]').click({ force: true });

    // Clicks on update vote
    await page.locator('text=Update vote').click();

    // Move to submit ballot screen
    await page.locator('[data-testid="submit-ballot-button"]').click();

    await expect(page.locator('text=Gasless voting via Arbitrum')).toBeVisible();

    // Switch to legacy voting for this test
    await page.locator('[data-testid="switch-to-legacy-voting-button"]').click();

    await expect(page.locator(
    'text=Submit your vote by creating a transaction and sending it to the polling contract on Ethereum Mainnet.'
    )).toBeVisible();

    // Click legacy voting submit button
    await page.locator('[data-testid="submit-ballot-legacy-button"]').click();

    await expect(page.locator('text=Please use your wallet to sign')).toBeVisible();

    //await expect(page.locator('text=Transaction Pending')).toBeVisible();

    await expect(page.locator('text=Share all your votes')).toBeVisible();

    // After finishing voting, there should be a message with the sharing info
    await expect(page.locator(
    'text=Share your votes to the Forum or Twitter below, or go back to the polls page to edit your votes'
    )).toBeVisible();

    // And the same amount of poll cards
    await expect(page.locator('[data-testid="poll-overview-card"]')).toHaveCount(1);

});


//Skip this test because eth_signTypedData_v4 doesn't work with the mock connector
//We'd need to find a way to update the CustomizedBridge to handle eth_signTypedData_v4 to get this to work.
test.skip('Adds polls to review and navigates to review page and votes with the gasless system', async ({ page }) => {
    await page.goto('/polling');

    await expect(page.getByRole('heading', { name: /Active Polls|Ended Polls/ })).toBeVisible();
    
    await connectWallet(page);

    const selectedPollId = 1107;
    const selectChoice = page.locator('[data-testid="single-select"]');

    await selectChoice.nth(0).click();

    // click on option
    await page.locator('[data-testid="single-select-option-Yes"]').first().click();

    const buttonsVote = page.locator('[data-testid="button-add-vote-to-ballot"]');

    // Click the button
    await expect(buttonsVote.first()).toBeEnabled();

    await buttonsVote.first().click();

    // Check the ballot count has increased
    await expect(page.locator('text=/1 of .* available poll(s)? added to ballot/')).toBeVisible();

    // Click on the navigate
    await page.locator('text=Review & Submit Your Ballot').click();

    await expect(page).toHaveURL('/polling/review');

    // Poll card should display poll IDs
    await expect(page.locator(`text=Poll ID ${selectedPollId}`)).toBeVisible();

    // It can edit a choice
    await page.locator('[data-testid="edit-poll-choice"]').click();

    // Opens the select
    await selectChoice.first().click();

    // Clicks on "No"
    await page.locator('[data-testid="single-select-option-No"]').click({ force: true });

    // Clicks on update vote
    await page.locator('text=Update vote').click();

    // Move to submit ballot screen
    await page.locator('[data-testid="submit-ballot-button"]').click();

    await expect(page.locator('text=Gasless voting via Arbitrum')).toBeVisible();

    // vote via gasless
    await page.locator('[data-testid="submit-ballot-gasless-button"]').click();

    await expect(page.locator(
    'text=Submit your vote by creating a transaction and sending it to the polling contract on Ethereum Mainnet.'
    )).toBeVisible();

    // Click legacy voting submit button
    await page.locator('[data-testid="submit-ballot-legacy-button"]').click();

    await expect(page.locator('text=Please use your wallet to sign')).toBeVisible();

    //await expect(page.locator('text=Transaction Pending')).toBeVisible();

    await expect(page.locator('text=Share all your votes')).toBeVisible();

    // After finishing voting, there should be a message with the sharing info
    await expect(page.locator(
    'text=Share your votes to the Forum or Twitter below, or go back to the polls page to edit your votes'
    )).toBeVisible();

    // And the same amount of poll cards
    await expect(page.locator('[data-testid="poll-overview-card"]')).toHaveCount(1);

});
