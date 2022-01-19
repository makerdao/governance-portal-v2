import { request } from 'graphql-request';
import { CHAIN_INFO, SupportedChainId } from 'modules/web3/web3.constants';

export const gqlRequest = async ({
  chainId,
  query,
  variables
}: {
  chainId?: number;
  query: any;
  variables?: Record<any, any>;
}): Promise<any> => {
  const id = chainId ?? SupportedChainId.MAINNET;
  const url = CHAIN_INFO[id].spockUrl;

  return await request(url, query, variables);
};
