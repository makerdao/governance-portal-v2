import { getPolls } from 'modules/polling/api/fetchPolls';
import { Poll, PollCategory } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchJson } from 'lib/fetchJson';

export type PollingReviewPageData = {
  polls: Poll[];
};

export type PollingPageData = {
  polls: Poll[];
  categories: PollCategory[];
};

export async function fetchPollingPageData(
  network: SupportedNetworks,
  useApi = false
): Promise<PollingPageData> {
  const pollsData = useApi
    ? await fetchJson(`/api/polling/all-polls?network=${network}`)
    : await getPolls(undefined, network);

  return {
    polls: (pollsData as PollingPageData).polls,
    categories: (pollsData as PollingPageData).categories
  };
}
