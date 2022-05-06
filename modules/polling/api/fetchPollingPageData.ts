import { getPolls } from 'modules/polling/api/fetchPolls';
import { Poll, PollCategory } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export type PollingReviewPageData = {
  polls: Poll[];
};

export type PollingPageData = {
  polls: Poll[];
  categories: PollCategory[];
};

export async function fetchPollingPageData(network: SupportedNetworks): Promise<PollingPageData> {
  const pollsData = await getPolls(undefined, network);

  return {
    polls: pollsData.polls,
    categories: pollsData.categories
  };
}
