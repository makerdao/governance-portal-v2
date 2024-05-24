type TestAccount = {
    name: string;
    address: string;
    key: string;
  };
  

enum TestAccountsEnum {
  normal = 'normal',
}

interface TestAccounts {
  [key: string]: TestAccount;
}

export const TEST_ACCOUNTS: TestAccounts = {
  [TestAccountsEnum.normal]: {
    name: 'Default test account',
    address: '0x8028Ef7ADA45AA7fa31EdaE7d6C30BfA5fb3cf0B',
    key: '89dc8729657f93064432dc2e85136b90296fedfda086d4e610dd60c7d7654c41'
  }
};



export async function connectWallet(page) {
    await page.getByRole('button', {name: 'Connect wallet'}).click();
    try {
      await page.waitForSelector('text="Connected with Mock"', { timeout: 2000 });
    } catch (error) {
      await page.locator('div').filter({hasText: /^MockSelect$/}).getByRole('button').click();
    }
}

export function closeModal(page) {
    page.locator('[aria-label="close"]').click();
}

