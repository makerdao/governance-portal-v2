import { request, Variables, RequestDocument } from 'graphql-request';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { CHAIN_INFO } from 'modules/web3/constants/networks';

type GqlRequestProps = {
  chainId?: SupportedChainId;
  query: RequestDocument;
  variables?: Variables | null;
};

// TODO we'll be able to remove the "any" if we update all the instances of gqlRequest to pass <Query>
export const gqlRequest = async <TQuery = any>({
  chainId,
  query,
  variables
}: GqlRequestProps): Promise<TQuery> => {
  const id = chainId ?? SupportedChainId.MAINNET;
  const url = CHAIN_INFO[id].spockUrl;

  return await request(url, query, variables);
};
