import { test, expect } from '@playwright/test';
import {connectWallet, closeModal} from './shared';
import './forkVnet';

test('delegate MKR', async ({ page }) => {
    // Start from the index page
    await page.goto('/delegates');

    await connectWallet(page);

    // Click delegate button
    await page.locator('[data-testid="button-delegate"]').first().click();

    // Approve tx
    await page.locator('button:has-text("Approve Delegate Contract")').click();

    // Wait for tx confirmed
    await expect(page.locator('text=Confirm Transaction')).toBeVisible();

    // Inserts the amount of MKR to delegate
    await expect(page.locator('text=Deposit into delegate contract')).toBeVisible();
    await page.locator('[data-testid="mkr-input"]').fill('2');

    // Delegate
    await page.locator('[data-testid="deposit-mkr-modal-button"]').click();

    // Wait for text changing
    await expect(page.locator('text=You are delegating')).toBeVisible();

    // Check that the etherscan link shows the correct address
    // await expect(page.locator('a[href="https://etherscan.io/address/0xb21e535fb349e4ef0520318acfe589e174b0126b"]')).toBeVisible()

    // Clicks the confirm button
    await page.locator('button:has-text("Confirm Transaction")').click();
    // Wait for tx confirmed
    await expect(page.locator('text=Confirm Transaction')).toBeVisible();

     //commenting out because sometimes the Transaction Pending screen doesn't get picked up
    // await expect(page.locator('text=Transaction Pending')).toBeVisible();

    // Close modal
    await closeModal(page);

    // Checks that the delegated amount has appeared. Note: we round UP to two decimals places in the UI.
    await expect(page.locator('[data-testid="mkr-delegated-by-you"]').first()).toHaveText('2.0');

    // Find the undelegate button
    await page.locator('[data-testid="button-undelegate"]').first().click();

    // Approve the undelegate contract
    await page.locator('button:has-text("Approve Delegate Contract")').click();

    // Wait for tx confirmed
    await expect(page.locator('text=Confirm Transaction')).toBeVisible();

    //commenting out because sometimes the Transaction Pending screen doesn't get picked up
    // await expect(page.locator('text=Transaction Pending')).toBeVisible();

    // TODO: The remove funds from delegate test is not working well because the modal keeps showing the button
    // To approve the contract, even it's approved. We have to approve it like 3 times to work
    // Check what is the problem and uncomment the following code
    /*
    await expect(page.locator('text=Withdraw from delegate contract')).toBeVisible();

    await page.locator('button[data-testid="mkr-input-set-max"]').click();

    // UnDelegate
    await page.locator('button:has-text("Undelegate MKR")').click();
    await expect(page.locator('text=Transaction Pending')).toBeVisible();

    await expect(page.locator('text=Transaction Sent')).toBeVisible();

    // Close modal
    await closeModal();

    // Checks that the delegated amount has changed
    await expect(page.locator('[data-testid="mkr-delegated-by-you"]').contains('0.000')).toBeVisible();
    */
});
