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

  // TODO: Change to mainnet once mainnet is supported and merged.
  const delegatesRepositoryInfo = network === SupportedNetworks.MAINNET ? repoKovan : repoKovan;
  return delegatesRepositoryInfo;
}
