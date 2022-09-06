import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getMKRVotingWeight, MKRVotingWeightResponse } from 'modules/mkr/helpers/getMKRVotingWeight';
import { BigNumber } from 'ethers';

export async function hasMkrRequiredVotingWeight(
  voter: string,
  network: SupportedNetworks,
  weight: BigNumber,
  canBeEqual = false
): Promise<boolean> {
  //verify address has a poll weight > weight param
  const pollWeight: MKRVotingWeightResponse = await getMKRVotingWeight(voter, network);

  const hasMkrRequired = canBeEqual ? pollWeight.total.gte(weight) : pollWeight.total.gt(weight);

  return hasMkrRequired;
}
