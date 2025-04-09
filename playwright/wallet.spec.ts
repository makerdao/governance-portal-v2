import { test } from './fixtures/base';
import { expect } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test('should show wallet modal and handle connection flow', async ({ page, walletPage }) => {
    await test.step('navigate to home page', async () => {
      await page.goto('/');
    });

    await test.step('connect wallet', async () => {
      await walletPage.clickConnectWallet();
      await walletPage.waitForConnection();
    });

    await test.step('verify wallet modal', async () => {
      await walletPage.openWalletModal();
      await walletPage.verifyWalletModal();
    });

    await test.step('verify wallet selection flow', async () => {
      await walletPage.clickChangeWallet();
      await walletPage.verifyWalletSelectionModal();
    });

    await test.step('close wallet modal', async () => {
      await walletPage.clickBackButton();
      await walletPage.closeModal();
    });
  });

  test('should navigate to account page', async ({ page, walletPage }) => {
    await test.step('navigate to home page', async () => {
      await page.goto('/');
    });

    await test.step('connect wallet', async () => {
      await walletPage.clickConnectWallet();
      await walletPage.waitForConnection();
    });

    await test.step('navigate to account page', async () => {
      await walletPage.openWalletModal();
      await walletPage.clickViewAccountPage();
      await expect(page).toHaveURL('/account');
    });
  });
});
