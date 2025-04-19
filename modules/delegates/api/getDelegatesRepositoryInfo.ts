/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';

export type RepositoryInfo = {
  owner: string;
  repo: string;
  page: string;
};

export function getDelegatesRepositoryInformation(network: SupportedNetworks): RepositoryInfo {
  const repoMainnet = {
    owner: 'jetstreamgg',
    repo: 'gov-metadata',
    page: 'delegates'
  };

  const repoTest = {
    owner: 'jetstreamgg',
    repo: 'gov-metadata',
    page: 'delegates'
  };

  const delegatesRepositoryInfo =
    network === SupportedNetworks.MAINNET || SupportedNetworks.TENDERLY ? repoMainnet : repoTest;
  return delegatesRepositoryInfo;
}

export function getDelegatesIndexFileUrl(network: SupportedNetworks) {
  const { owner, repo, page } = getDelegatesRepositoryInformation(network);
  return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main/${page}/index.json`;
}

export function getMetadataRepoBaseUrl(network: SupportedNetworks) {
  const { owner, repo } = getDelegatesRepositoryInformation(network);
  return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main`;
}
