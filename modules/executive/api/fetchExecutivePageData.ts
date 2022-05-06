import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { Proposal } from 'modules/executive/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export type ExecutivePageData = {
  proposals: Proposal[];
};

export const NUMBER_OF_EXECS_TO_FETCH = 10;

export async function fetchExecutivePageData(network: SupportedNetworks): Promise<ExecutivePageData> {
  const proposals = await getExecutiveProposals(0, NUMBER_OF_EXECS_TO_FETCH, 'active', network);

  return {
    proposals
  };
}
