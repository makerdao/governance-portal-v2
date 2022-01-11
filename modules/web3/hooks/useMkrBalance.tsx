import useSWR from 'swr';
import { ethers } from 'ethers';
import { getGoerliSdk } from '@dethcrypto/eth-sdk-client';

type UseMkrBalanceResponse = {
  data?: any;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

const mainnetProvider = ethers.getDefaultProvider('mainnet');
const defaultSigner = ethers.Wallet.createRandom().connect(mainnetProvider);
const { mkr } = getGoerliSdk(defaultSigner);

export const useMkrBalance = (address: string): UseMkrBalanceResponse => {
  const { data, error, mutate } = useSWR(`mkr-balance-new-${address}`, async () => {
    const balance = await mkr.balanceOf(address);

    return ethers.utils.formatUnits(balance, 18);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
