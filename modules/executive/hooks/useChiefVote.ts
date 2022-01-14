import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BytesLike, ContractTransaction } from 'ethers';

type ChiefVote = {
  // data?: ContractTransaction | undefined;
  // loading: boolean;
  // error?: Error;
  // call: Promise<ContractTransaction>;
  voteOne: any;
  voteMany: any;
};

export const useChiefVote = (): ChiefVote => {
  const { chief } = useContracts();
  // const call = Array.isArray(slateOrProposals) ? chief['vote(address[])'] : chief['vote(bytes32)'];

  return { voteOne: chief['vote(bytes32)'], voteMany: chief['vote(address[])'] };

  // const { data, error } = useSWR('chief-vote', async () => {
  //   return await call(slateOrProposals);
  // });

  // return {
  //   data,
  //   loading: !error && !data,
  //   error
  // };
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
