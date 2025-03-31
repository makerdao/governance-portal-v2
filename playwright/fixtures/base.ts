import { test as base } from '@playwright/test';
import { PollingPage } from './polling';
import { WalletPage } from './wallet';

type Fixtures = {
  pollingPage: PollingPage;
  walletPage: WalletPage;
};

export const test = base.extend<Fixtures>({
  pollingPage: async ({ page }, use) => {
    await use(new PollingPage(page));
  },
  walletPage: async ({ page }, use) => {
    await use(new WalletPage(page));
  }
});

export { expect } from '@playwright/test';
