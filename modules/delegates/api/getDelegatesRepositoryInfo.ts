import { SupportedNetworks } from 'modules/web3/constants/networks';

type RepositoryInfo = {
  owner: string;
  repo: string;
  page: string;
};

export function getDelegatesRepositoryInformation(network: SupportedNetworks): RepositoryInfo {
  const repoMainnet = {
    owner: 'makerdao',
    repo: 'community',
    page: 'governance/delegates'
  };

  const repoTest = {
    owner: 'makerdao-dux',
    repo: 'voting-delegates',
    page: 'delegates'
  };

  const delegatesRepositoryInfo = network === SupportedNetworks.MAINNET ? repoMainnet : repoTest;
  return delegatesRepositoryInfo;
}
