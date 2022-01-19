import { request } from 'graphql-request';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { CHAIN_INFO } from 'modules/web3/constants/networks';

export const gqlRequest = async ({
  chainId,
  query,
  variables
}: {
  chainId?: SupportedChainId;
  query: any;
  variables?: Record<any, any>;
}): Promise<any> => {
  const id = chainId ?? SupportedChainId.MAINNET;
  const url = CHAIN_INFO[id].spockURL;

  return await request(url, query, variables);
};
