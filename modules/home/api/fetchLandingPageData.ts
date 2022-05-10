import { getPolls } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { fetchMkrOnHat } from 'modules/executive/api/fetchMkrOnHat';
import { fetchMkrInChief } from 'modules/executive/api/fetchMkrInChief';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';
import { shuffleArray } from 'lib/common/shuffleArray';
import { formatValue } from 'lib/string';
import { Proposal } from 'modules/executive/types';
import { Poll } from 'modules/polling/types';
import { Delegate, DelegatesAPIResponse } from 'modules/delegates/types';
import { PollsResponse } from 'modules/polling/types/pollsResponse';
import { MkrOnHatResponse } from 'modules/executive/api/fetchMkrOnHat';
import { BigNumber } from 'ethers';

export type LandingPageData = {
  proposals: Proposal[];
  polls: Poll[];
  delegates: Delegate[];
  recognizedDelegates: Delegate[];
  meetYourDelegates: Delegate[];
  totalMKRDelegated: string;
  mkrOnHat?: string;
  hat?: string;
  mkrInChief?: string;
};

export async function fetchLandingPageData(network: SupportedNetworks): Promise<LandingPageData> {
  const responses = await Promise.allSettled([
    getExecutiveProposals(0, 3, 'active', network),
    getPolls(undefined, network),
    fetchDelegates(network, 'mkr'),
    fetchMkrOnHat(network),
    fetchMkrInChief(network)
  ]);

  // return null for any data we couldn't fetch
  const [proposals, pollsData, delegatesResponse, mkrOnHatResponse, mkrInChief] = responses.map(promise =>
    promise.status === 'fulfilled' ? promise.value : null
  );

  // filter delegates
  const recognizedDelegates = filterDelegates(
    (delegatesResponse as DelegatesAPIResponse).delegates,
    false,
    true
  );
  const meetYourDelegates = shuffleArray(recognizedDelegates);

  return {
    proposals: proposals ? (proposals as Proposal[]).filter(i => i.active) : [],
    polls: pollsData ? (pollsData as PollsResponse).polls : [],
    delegates: delegatesResponse ? (delegatesResponse as DelegatesAPIResponse).delegates : [],
    totalMKRDelegated: delegatesResponse
      ? (delegatesResponse as DelegatesAPIResponse).stats.totalMKRDelegated
      : '0',
    recognizedDelegates,
    meetYourDelegates,
    mkrOnHat: mkrOnHatResponse ? formatValue((mkrOnHatResponse as MkrOnHatResponse).mkrOnHat) : undefined,
    hat: mkrOnHatResponse ? (mkrOnHatResponse as MkrOnHatResponse).hat : undefined,
    mkrInChief: mkrInChief ? formatValue(mkrInChief as BigNumber) : undefined
  };
}
