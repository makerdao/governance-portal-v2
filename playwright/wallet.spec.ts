import { test } from './fixtures/base';
import { expect } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test('should show wallet modal and handle connection flow', async ({ page, walletPage }) => {
    await page.goto('/');

    await walletPage.clickConnectWallet();
    await walletPage.waitForConnection();

    await walletPage.openWalletModal();
    await walletPage.verifyWalletModal();

    await walletPage.clickChangeWallet();
    await walletPage.verifyWalletSelectionModal();

    await walletPage.clickBackButton();
    await walletPage.closeModal();
  });

  test('should navigate to account page', async ({ page, walletPage }) => {
    await page.goto('/');

    // Connect wallet first
    await walletPage.clickConnectWallet();
    await walletPage.waitForConnection();

    // Open wallet modal
    await walletPage.openWalletModal();

    // Click view account page and verify navigation
    await walletPage.clickViewAccountPage();
    await expect(page).toHaveURL('/account');
  });
});
