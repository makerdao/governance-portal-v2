import { fetchJson } from 'lib/fetchJson';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { Proposal } from 'modules/executive/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export type ExecutivePageData = {
  proposals: Proposal[];
};

export const EXEC_FETCH_SIZE = 5;
const EXEC_SORT_BY = 'active';

export async function fetchExecutivePageData(
  network: SupportedNetworks,
  useApi = false
): Promise<ExecutivePageData> {
  const proposals = useApi
    ? await fetchJson(
        `/api/executive?network=${network}&start=0&limit=${EXEC_FETCH_SIZE}&sortBy=${EXEC_SORT_BY}`
      )
    : await getExecutiveProposals({ start: 0, limit: EXEC_FETCH_SIZE, sortBy: EXEC_SORT_BY, network });

  return {
    proposals: proposals as Proposal[]
  };
}
