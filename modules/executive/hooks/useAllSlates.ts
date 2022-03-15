import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { DEPLOYMENT_BLOCK } from 'modules/contracts/contracts.constants';

type AllSlatesResponse = {
  data?: string[];
  loading: boolean;
  error?: Error;
};

export const useAllSlates = (): AllSlatesResponse => {
  const { chief } = useContracts();

  const { data, error } = useSWR(`/${chief.address}/executive/all-slates`, async () => {
    const eventFragment = chief.interface.events['Etch(bytes32)'];
    const etchTopics = chief.interface.encodeFilterTopics(eventFragment, []);

    const filter = {
      fromBlock: DEPLOYMENT_BLOCK[chief.address],
      toBlock: 'latest',
      address: chief.address,
      topics: etchTopics
    };
    const logs = await chief.provider.getLogs(filter);
    const topics = logs.map(e => e.topics[1]);
    return topics;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
