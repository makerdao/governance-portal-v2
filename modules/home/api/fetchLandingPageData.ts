import { getPolls } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { fetchMkrOnHat } from 'modules/executive/api/fetchMkrOnHat';
import { fetchMkrInChief } from 'modules/executive/api/fetchMkrInChief';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';
import { shuffleArray } from 'lib/common/shuffleArray';
import { formatValue } from 'lib/string';

// types
import { Proposal } from 'modules/executive/types';
import { Poll } from 'modules/polling/types';
import { Delegate } from 'modules/delegates/types';

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
  const [proposals, pollsData, delegatesResponse, { hat, mkrOnHat }, mkrInChief] = await Promise.all([
    getExecutiveProposals(0, 3, 'active', network),
    getPolls(undefined, network),
    fetchDelegates(network, 'mkr'),
    fetchMkrOnHat(network),
    fetchMkrInChief(network)
  ]);
  const recognizedDelegates = filterDelegates(delegatesResponse.delegates, false, true);
  const meetYourDelegates = shuffleArray(recognizedDelegates);

  return {
    proposals: proposals.filter(i => i.active),
    polls: pollsData.polls,
    delegates: delegatesResponse.delegates,
    totalMKRDelegated: delegatesResponse.stats.totalMKRDelegated,
    recognizedDelegates,
    meetYourDelegates,
    mkrOnHat: formatValue(mkrOnHat),
    hat,
    mkrInChief: formatValue(mkrInChief)
  };
}
