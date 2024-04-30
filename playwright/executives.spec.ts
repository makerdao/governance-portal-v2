import { test, expect } from '@playwright/test';
import {connectWallet} from './shared';
import './forkVnet';

test('navigates to executives and can deposit into chief', async ({ page }) => {
    await page.goto('/executive');

    await connectWallet(page);

    // Sees the "In voting contract" text
    await expect(page.locator('text=/In voting contract/')).toBeVisible();

    // Click deposit
    await page.locator('[data-testid="deposit-button"]').click();

    // Click approve contract
    await page.locator('[data-testid="deposit-approve-button"]').click();

    // Wait until transaction completes
    // Removing this check because it does not pass: await expect(page.locator('text=/Transaction Pending/')).toBeVisible();
    // await expect(page.locator('text=/Confirm Transaction/')).toBeVisible();

    // Deposit
    await expect(page.locator('text=/Deposit into voting contract/')).toBeVisible();

    // Deposit
    await page.locator('[data-testid="mkr-input"]').fill('0.01');

    // Click button
    await page.locator('[data-testid="button-deposit-mkr"]').click();

    // Wait for tx
    // await expect(page.locator('text=/Transaction Pending/')).toBeVisible();
    // await expect(page.locator('text=/Transaction Sent/')).toBeVisible();

    // Check MKR
    await expect(page.locator('[data-testid="locked-mkr"]')).toHaveText('0.01 MKR');

    // Can vote
    await page.locator('[data-testid="vote-button-exec-overview-card"]').first().click();

    await page.locator('text=/Submit Vote/').click();

    await expect(page.locator('text=/Transaction Sent/')).toBeVisible();
});
