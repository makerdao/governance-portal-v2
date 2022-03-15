import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';

type EsmIsActiveResponse = {
  data?: boolean;
  loading: boolean;
  error?: Error;
};

export const useEsmIsActive = (): EsmIsActiveResponse => {
  const { end } = useContracts();

  const { data, error } = useSWR(`${end.address}/esm-is-active`, async () => {
    const isLive = await end.live();
    // returns 0 if active, otherwise returns 1
    return isLive.toNumber() !== 1;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
