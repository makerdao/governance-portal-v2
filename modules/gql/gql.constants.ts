/* Spock URLs */
export const LOCAL_SPOCK_URL = 'http://localhost:3001/v1';
export const GOERLI_SPOCK_URL = 'https://pollingdb2-goerli-staging.makerdux.com/api/v1';
// export const GOERLI_SPOCK_URL = 'https://polling-db-goerli.makerdux.com/api/v1';

//TODO: switch both back to actual deployment
// export const STAGING_MAINNET_SPOCK_URL = 'https://polling-db-staging.makerdux.com/api/v1';
export const STAGING_MAINNET_SPOCK_URL = 'https://b0f9-3-69-177-22.eu.ngrok.io/v1';
// export const MAINNET_SPOCK_URL = 'https://polling-db-prod.makerdux.com/api/v1';
export const MAINNET_SPOCK_URL = 'https://b0f9-3-69-177-22.eu.ngrok.io/v1';

export enum QueryFilterNames {
  Active = 'active',
  PollId = 'pollId',
  Range = 'range',
  MultiHash = 'multiHash'
}
