/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { RepositoryInfo } from 'modules/delegates/api/getDelegatesRepositoryInfo';

export function getAvcsRepositoryInformation(network: SupportedNetworks): RepositoryInfo {
  const repoMainnet = {
    owner: 'makerdao',
    repo: 'community',
    page: 'governance/delegates/templates'
  };

  const repoTest = {
    owner: 'makerdao-dux',
    repo: 'voting-delegates',
    page: 'delegates/templates'
  };

  const avcsRepositoryInfo =
    network === SupportedNetworks.MAINNET || network === SupportedNetworks.TENDERLY ? repoMainnet : repoTest;
  return avcsRepositoryInfo;
}
