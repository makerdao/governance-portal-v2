import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type TotalDaiResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
};

export const useSystemSurplus = (): TotalDaiResponse => {
  const { vat, vow } = useContracts();

  const { data, error } = useSWR('system-surplus', async () => {
    const [dai, sin] = await Promise.all([await vat.dai(vow.address), await vat.sin(vow.address)]);

    return dai.sub(sin);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
