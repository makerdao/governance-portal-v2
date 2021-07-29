import { SupportedNetworks } from 'lib/constants';

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

  const repoKovan = {
    owner: 'makerdao-dux',
    repo: 'voting-delegates',
    page: 'delegates'
  };

  const delegatesRepositoryInfo = network === SupportedNetworks.MAINNET ? repoMainnet : repoKovan;
  return delegatesRepositoryInfo;
}
