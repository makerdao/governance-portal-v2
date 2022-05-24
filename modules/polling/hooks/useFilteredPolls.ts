import useSWR from 'swr';
import { Poll } from 'modules/polling/types';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { fetchJson } from 'lib/fetchJson';

type FilteredPollsResponse = {
  data?: Poll[];
  loading: boolean;
  error?: Error;
};

export const useFilteredPolls = (
  categories?: { [category: string]: boolean } | null
): FilteredPollsResponse => {
  const { network } = useActiveWeb3React();
  const selectedCategories = categories ? Object.keys(categories).filter(cat => !!categories[cat]) : null;

  const { data, error } = useSWR(
    selectedCategories
      ? `/api/polling/all-polls?network=${network}&categories=${selectedCategories.sort()}`
      : null,
    fetchJson
  );

  return {
    data: data?.polls,
    loading: !error && !data,
    error
  };
};
