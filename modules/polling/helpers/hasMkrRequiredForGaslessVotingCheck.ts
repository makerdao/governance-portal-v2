import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getMKRVotingWeight, MKRVotingWeightResponse } from 'modules/mkr/helpers/getMKRVotingWeight';
import { MIN_MKR_REQUIRED_FOR_GASLESS_VOTING } from 'modules/polling/polling.constants';
import { WAD } from 'modules/web3/constants/numbers';

export async function hasMkrRequiredForGaslessVotingCheck(
  voter: string,
  network: SupportedNetworks
): Promise<boolean> {
  //verify address has a poll weight > 0.1 MKR
  const pollWeight: MKRVotingWeightResponse = await getMKRVotingWeight(voter, network);

  const hasMkrRequired = pollWeight.total.lt(WAD.div(1 / MIN_MKR_REQUIRED_FOR_GASLESS_VOTING));

  return hasMkrRequired;
}
