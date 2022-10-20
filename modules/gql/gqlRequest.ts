import { request, Variables, RequestDocument } from 'graphql-request';
import logger from 'lib/logger';
import { backoffRetry } from 'lib/utils';
import { ApiError } from 'modules/app/api/ApiError';
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
  try {
    const id = chainId ?? SupportedChainId.MAINNET;
    const url = CHAIN_INFO[id].spockUrl;
    if (!url) {
      return Promise.reject(new ApiError(`Missing spock url in configuration for chainId: ${id}`));
    }
    const resp = await backoffRetry(
      3,
      () => request(url, query, variables),
      500,
      (message: string) => {
        logger.debug(`GQL Request: ${message}. --- ${query}`);
      }
    );
    return resp;
  } catch (e) {
    const status = e.response ? e.response.status : 500;
    const errorMessage = status === 403 ? 'Rate limited on gov polling' : e.message;
    const message = `Error on GraphQL query, Chain ID: ${chainId}, query: ${query}, message: ${errorMessage}`;
    throw new ApiError(message, status, 'Error fetching gov polling data');
  }
};
