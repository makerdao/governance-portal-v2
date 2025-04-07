import { test as base } from '@playwright/test';
import { PollingPage } from './polling';
import { WalletPage } from './wallet';
import { ExecutivePage } from './executive';
import { DelegatePage } from './delegate';

type Fixtures = {
  pollingPage: PollingPage;
  walletPage: WalletPage;
  executivePage: ExecutivePage;
  delegatePage: DelegatePage;
};

export const test = base.extend<Fixtures>({
  pollingPage: async ({ page }, use) => {
    await use(new PollingPage(page));
  },
  walletPage: async ({ page }, use) => {
    await use(new WalletPage(page));
  },
  executivePage: async ({ page }, use) => {
    await use(new ExecutivePage(page));
  },
  delegatePage: async ({ page }, use) => {
    await use(new DelegatePage(page));
  }
});

export { expect } from '@playwright/test';
