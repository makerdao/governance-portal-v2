import { test as base } from '@playwright/test';
import { PollingPage } from './PollingPage';

type Fixtures = {
  pollingPage: PollingPage;
};

export const test = base.extend<Fixtures>({
  pollingPage: async ({ page }, use) => {
    const pollingPage = new PollingPage(page);
    await use(pollingPage);
  }
});

export { expect } from '@playwright/test';
