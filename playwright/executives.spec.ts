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

    await expect(page.locator('text=/Confirm Transaction/')).toBeVisible();

    await expect(page.locator('text=/Transaction Pending/')).toBeVisible({timeout: 10000}); //tx can take some time to get signed

    // Deposit
    await expect(page.locator('text=/Deposit into voting contract/')).toBeVisible(); 

    // Deposit
    await page.locator('[data-testid="mkr-input"]').fill('0.01');

    // Click button
    await page.locator('[data-testid="button-deposit-mkr"]').click();

    await expect(page.locator('text=/Confirm Transaction/')).toBeVisible();

    // Wait for tx
    await expect(page.locator('text=/Transaction Pending/')).toBeVisible({ timeout: 10000 }); //tx can take some time to get signed
    // await expect(page.locator('text=/Transaction Sent/')).toBeVisible();

    // Check MKR
    await expect(page.locator('[data-testid="locked-mkr"]')).toHaveText('0.01 MKR');

    // Can vote
    await page.locator('[data-testid="vote-button-exec-overview-card"]').first().click();

    await page.locator('[data-testid="vote-modal-vote-btn"]').click();

    await expect(page.locator('text=/Transaction Sent/')).toBeVisible();
});
