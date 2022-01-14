import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type TotalDaiResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
};

export const useTotalDai = (): TotalDaiResponse => {
  const { vat } = useContracts();

  const { data, error } = useSWR('total-dai', async () => {
    return await vat.debt();
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};

// temp comment: dai.js implementation for reference

// async getTotalDai() {
//   const totalPie = new BigNumber((await this._pot.Pie())._hex);
//   const chi = await this.chi();
//   return DAI(
//     totalPie
//       .times(chi)
//       .div(WAD)
//       .dp(18)
//   );
// }
