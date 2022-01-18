import { createClient, ssrExchange, dedupExchange, cacheExchange, fetchExchange } from 'urql';

const isServerSide = typeof window === 'undefined';
const ssrCache = ssrExchange({ isClient: !isServerSide });
const client = createClient({
  // TODO: this should be dynamic based on network
  url: 'https://polling-db-staging.makerdux.com/api/v1',
  // TODO: come back to this
  exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
  fetchOptions: () => {
    return { headers: {} };
  }
});

export { client, ssrCache };
