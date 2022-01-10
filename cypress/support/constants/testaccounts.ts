import { TestAccount } from '../types/TestAccount';

enum TestAccountsEnum {
  normal = 'normal'
}

interface  TestAccounts {
  [key: string]: TestAccount
}

export const TEST_ACCOUNTS: TestAccounts = {
  // TODO: Add testchain accounts
  [TestAccountsEnum.normal]: {
    name: 'MakerDAO address 50MKR',
    address: '0xe8364a2646c11d9f68e388978337712253905248',
    key: '6533f0d8418046c856425a13c9d321702016d3942b4212ee07ed9ed9ac4fd6c1'
  }
};
