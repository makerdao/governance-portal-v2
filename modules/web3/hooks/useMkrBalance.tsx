import useSWR from 'swr';
import { ethers } from 'ethers';
import { getContract } from '../helpers/getContract';

type UseMkrBalanceResponse = {
  data?: any;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMkrBalance = (address: string): UseMkrBalanceResponse => {
  const network = 'mainnet'; // TODO: get this from state or URL
  const { mkr, dai } = getContract(network);

  const { data, error, mutate } = useSWR(`mkr-balance-new-${address}`, async () => {
    // TODO: I switched this to dai just to test on mainnet, switch back to mkr whenever
    const balance = await dai.balanceOf(address);

    return ethers.utils.formatUnits(balance, 18);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
