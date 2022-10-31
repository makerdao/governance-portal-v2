import { TestAccount } from '../types/TestAccount';
import keypairs from './keypairs.json';

enum TestAccountsEnum {
  normal = 'normal',
  delegate = 'delegate',
  voteProxyHot = 'voteProxyHot',
  voteProxyCold = 'voteProxyCold',
  hardhatOwned = 'hardhatOwned'
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
    address: '0x5fd0b82A53FB7df49dc6889Cd836EEF26516D0cB',
    key: '9e96498ebd6d4784a342bdf0bfd9ebfc77433783b67960ffa1c31a9630e5df80'
  },
  [TestAccountsEnum.voteProxyHot]: {
    name: 'Hot address for vote proxy',
    address: '0xBc05439E41914a0aF8cea663aC09DEc037bE0196',
    key: 'c8297c395531b74d8ae6785661648c11effaf91b9b200ca131d5f63c6613fc71'
  },
  [TestAccountsEnum.voteProxyCold]: {
    name: 'Cold address for vote proxy',
    address: '0x7E8e41CB87EEe353b3eF4eE5C8b770459EE11F0b',
    key: '20bc6ff8d800c8c024a7397796f1f3da45c55146a5306dcd6511cf41dbc99b04'
  },
  [TestAccountsEnum.hardhatOwned]: {
    name: 'Hardhat Owned at Index 1',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    key: '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
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
