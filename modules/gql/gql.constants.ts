/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/* Spock URLs */
export const LOCAL_SPOCK_URL = 'http://localhost:3001/v1';
export const STAGING_MAINNET_SPOCK_URL = 'https://pollingdb2-mainnet-staging.makerdux.com/api/v1';
export const MAINNET_SPOCK_URL = 'https://pollingdb2-mainnet-prod.makerdux.com/api/v1';
export const TENDERLY_SPOCK_URL = 'https://pollingdb2-tenderly-staging.makerdux.com/api/v1';

/* Subgraph URLs */
//NOTE: add /private to the end of the URL to make localy development easier if access denied
export const TENDERLY_SUBGRAPH_URL = 'https://query-subgraph-staging.sky.money/subgraphs/name/jetstreamgg/subgraph-testnet/public';
export const MAINNET_SUBGRAPH_URL = 'https://query-subgraph-staging.sky.money/subgraphs/name/jetstreamgg/subgraph-testnet/public';

export enum QueryFilterNames {
  Active = 'active',
  PollId = 'pollId',
  Range = 'range',
  MultiHash = 'multiHash'
}
