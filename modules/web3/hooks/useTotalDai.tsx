import useSWR from 'swr';
import { ethers } from 'ethers';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { WAD, RAY } from 'modules/web3/web3.constants';

export const useTotalDai = (): any => {
  const { pot } = useContracts();

  const { data, error } = useSWR('total-dai', async () => {
    const { BigNumber } = ethers;
    const totalPie = BigNumber.from(await pot.Pie());
    const chi = BigNumber.from(await pot.chi()).div(RAY);

    const totalDai = totalPie.mul(chi).div(WAD);

    return totalDai.toNumber();
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
