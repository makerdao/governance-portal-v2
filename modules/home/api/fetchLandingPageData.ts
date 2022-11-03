import { getPolls } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { fetchMkrOnHat } from 'modules/executive/api/fetchMkrOnHat';
import { fetchMkrInChief } from 'modules/executive/api/fetchMkrInChief';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatValue } from 'lib/string';
import { Proposal } from 'modules/executive/types';
import { Poll } from 'modules/polling/types';
import { PollsResponse } from 'modules/polling/types/pollsResponse';
import { MkrOnHatResponse } from 'modules/executive/api/fetchMkrOnHat';
import { BigNumber } from 'ethers';
import { fetchJson } from 'lib/fetchJson';
import { Delegate, DelegatesAPIStats } from 'modules/delegates/types';

export type LandingPageData = {
  proposals: Proposal[];
  polls: Poll[];
  delegates: Delegate[];
  stats?: DelegatesAPIStats;
  mkrOnHat?: string;
  hat?: string;
  mkrInChief?: string;
};

export async function fetchLandingPageData(
  network: SupportedNetworks,
  useApi = false
): Promise<Partial<LandingPageData>> {
  const EXEC_FETCH_SIZE = 5;
  const EXEC_SORT_BY = 'active';

  const responses = useApi
    ? await Promise.allSettled([
        fetchJson(
          `/api/executive?network=${network}&start=0&limit=${EXEC_FETCH_SIZE}&sortBy=${EXEC_SORT_BY}`
        ),
        fetchJson(`/api/polling/all-polls?network=${network}`),
        fetchMkrOnHat(network),
        fetchMkrInChief(network)
      ])
    : await Promise.allSettled([
        getExecutiveProposals({ start: 0, limit: EXEC_FETCH_SIZE, sortBy: EXEC_SORT_BY, network }),
        getPolls(undefined, network),
        fetchMkrOnHat(network),
        fetchMkrInChief(network)
      ]);

  // return null for any data we couldn't fetch
  const [proposals, pollsData, mkrOnHatResponse, mkrInChief] = responses.map(promise =>
    promise.status === 'fulfilled' ? promise.value : null
  );

  return {
    proposals: proposals ? (proposals as Proposal[]).filter(i => i.active) : [],
    polls: pollsData ? (pollsData as PollsResponse).polls : [],

    mkrOnHat: mkrOnHatResponse ? formatValue((mkrOnHatResponse as MkrOnHatResponse).mkrOnHat) : undefined,
    hat: mkrOnHatResponse ? (mkrOnHatResponse as MkrOnHatResponse).hat : undefined,
    mkrInChief: mkrInChief ? formatValue(mkrInChief as BigNumber) : undefined
  };
}
