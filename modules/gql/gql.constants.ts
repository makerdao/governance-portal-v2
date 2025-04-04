/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/* Spock URLs */
export const LOCAL_SPOCK_URL = 'http://localhost:3001/v1';
export const STAGING_MAINNET_SPOCK_URL = 'https://pollingdb2-mainnet-staging.makerdao.com/api/v1';
export const MAINNET_SPOCK_URL = 'https://pollingdb2-mainnet-prod.makerdao.com/api/v1';
export const TENDERLY_SPOCK_URL = 'https://pollingdb2-tenderly-staging.makerdao.com/api/v1';

/* Subgraph URLs */

export const TENDERLY_SUBGRAPH_URL =
  'https://query-subgraph-staging.sky.money/subgraphs/name/jetstreamgg/subgraph-testnet';
export const MAINNET_STAGING_SUBGRAPH_URL =
  'https://query-subgraph-staging.sky.money/subgraphs/name/jetstreamgg/subgraph-mainnet';
export const MAINNET_PROD_SUBGRAPH_URL =
  'https://query-subgraph.sky.money/subgraphs/name/jetstreamgg/subgraph-mainnet';
export const ARBITRUM_STAGING_SUBGRAPH_URL =
  'https://query-subgraph-staging.sky.money/subgraphs/name/jetstreamgg/subgraph-arbitrum';
export const ARBITRUM_PROD_SUBGRAPH_URL =
  'https://query-subgraph.sky.money/subgraphs/name/jetstreamgg/subgraph-arbitrum';

export enum QueryFilterNames {
  Active = 'active',
  PollId = 'pollId',
  Range = 'range',
  MultiHash = 'multiHash'
}
