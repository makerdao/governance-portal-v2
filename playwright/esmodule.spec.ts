import { test, expect } from '@playwright/test';
import { connectWallet, closeModal } from './shared';
import './forkVnet';

test('Input 150,000MKR and burn it', async ({ page }) => {
  await page.goto('/esmodule');

  await expect(page.locator('text=Emergency Shutdown Module')).toBeVisible();

  await connectWallet(page);

  await expect(page.locator('[data-testid="total-mkr-esmodule-staked"]')).toBeVisible();

  await expect(page.locator('text=Burn Your MKR')).toBeVisible();

  //Click "burn your MKR button"
  await page.locator('text=Burn Your MKR').click();

  // Checks the modal is open
  await expect(page.locator('text=Are you sure you want to burn MKR?')).toBeVisible();

  // Closes modal
  await page.locator('text=Cancel').click();

  // Click "burn your MKR button"
  await page.locator('text=Burn Your MKR').click();

  // Click continue
  await page.locator('text=Continue').click();

  // Enter 150000 MKR to pass the threshold
  await page.locator('[data-testid="mkr-input"]').fill('150000');

  // Continue with the burn
  await page.locator('text=Continue').click();

  // Type the passphrase
  await page.locator('[data-testid="confirm-input"]').fill('I am burning 150,000 MKR');

  // Unlock mkr
  await page.locator('[data-testid="allowance-toggle"]').click();

  // click on checkbox of accepted terms
  await page.locator('[data-testid="tosCheck"]').click();

  // The continue button should be enabled
  await expect(page.locator('[data-testid="continue-burn"]')).not.toBeDisabled();

  // Click continue
  await page.locator('[data-testid="continue-burn"]').click();

  // See confirmation
  //commenting out because this is only briefly shown if the threshold is met
  //await expect(page.locator('text=MKR successfully burned in ESM')).toBeVisible();

  // Close modal
  await closeModal(page);

  // Click "Initiate Emergency Shutdown" button
  await page.locator('text=Initiate Emergency Shutdown').click();

  // See that the limit has been reached
  await expect(page.locator('text=The 150,000 MKR limit for the emergency shutdown module has been reached.')).toBeVisible();

  // Continue and send the shutdown tx
  await page.locator('text=Continue').click();

  // Wait for signature
  await expect(page.locator('text=Sign TX to start Emergency Shutdown.')).toBeVisible();

  // Wait for signature
  await expect(page.locator('text=Transaction Sent!')).toBeVisible();

  // Close modal
  await page.locator('button:has-text("Close")').click();

  // Shows banner after shutdown
  // await expect(page.locator('[data-testid="es-initiated"]').locator('text=Emergency shutdown has been initiated on')).toBeVisible();
});
