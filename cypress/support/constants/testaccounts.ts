import { TestAccount } from '../types/TestAccount';
import keypairs from './keypairs.json';

enum TestAccountsEnum {
  normal = 'normal',
  delegate = 'delegate',
  normalVoteProxy = 'normalVoteProxy'
}

interface TestAccounts {
  [key: string]: TestAccount;
}

export const TEST_ACCOUNTS: TestAccounts = {
  // TODO: Create the delegate , voteproxy and other setups on the Goerli fork
  [TestAccountsEnum.normal]: {
    name: 'MakerDAO address 100MKR/5ETH',
    address: '0x8028Ef7ADA45AA7fa31EdaE7d6C30BfA5fb3cf0B',
    key: '89dc8729657f93064432dc2e85136b90296fedfda086d4e610dd60c7d7654c41'
  },
  [TestAccountsEnum.delegate]: {
    name: 'MakerDAO address delegate owner',
    address: '0x81431b69b1e0e334d4161a13c2955e0f3599381e',
    key: 'b3ae65f191aac33f3e3f662b8411cabf14f91f2b48cf338151d6021ea1c08541'
  }
};

const usedAddresses = {};

function getRandomNumber(max: number): number {
  return Math.floor(Math.random() * max);
}

export function getTestAccount(): TestAccount {
  // We only have seeded the first 50 accounts with 0.5 ETH and 0.01 MKR
  const MAX_ACCOUNT = 50;
  let number = getRandomNumber(MAX_ACCOUNT);

  while (usedAddresses[number] === true) {
    number = getRandomNumber(MAX_ACCOUNT);
  }

  usedAddresses[number] = true;

  return {
    address: keypairs.addresses[number],
    key: keypairs.keys[number],
    name: 'Random test account;'
  };
}

export function getTestAccountByIndex(i: number): TestAccount {
  return {
    address: keypairs.addresses[i],
    key: keypairs.keys[i],
    name: 'Random test account;'
  };
}
