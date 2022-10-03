import { BigNumber } from 'ethers';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';

export type MKRVotingWeightResponse = {
  walletBalanceHot: BigNumber;
  walletBalanceCold?: BigNumber;
  chiefBalanceHot: BigNumber;
  chiefBalanceCold?: BigNumber;
  chiefBalanceProxy?: BigNumber;
  chiefTotal: BigNumber;
  total: BigNumber;
};
// returns the voting weight for an address
export async function getMKRVotingWeight(
  address: string,
  network: SupportedNetworks
): Promise<MKRVotingWeightResponse> {
  const contracts = getContracts(networkNameToChainId(network), undefined, undefined, true);

  // first check if the address is a delegate contrac and if so return the balance locked in the delegate contract
  const voteDelegateAddress = await getDelegateContractAddress(contracts, address);
  if (voteDelegateAddress) {
    const mkrDelegate = await contracts.mkr.balanceOf(voteDelegateAddress);
    const mkrChiefDelegate = await contracts.chief.deposits(voteDelegateAddress);
    return {
      walletBalanceHot: mkrDelegate,
      chiefBalanceHot: mkrChiefDelegate,
      chiefTotal: mkrChiefDelegate,
      total: mkrDelegate.add(mkrChiefDelegate)
    };
  }

  // next check if address is part of a proxy set up
  const voteProxyAddresses = await getVoteProxyAddresses(contracts.voteProxyFactory, address, network);

  if (
    voteProxyAddresses.hasProxy &&
    voteProxyAddresses.hotAddress &&
    voteProxyAddresses.coldAddress &&
    voteProxyAddresses.voteProxyAddress
  ) {
    const [walletBalanceHot, walletBalanceCold, chiefBalanceHot, chiefBalanceCold, chiefBalanceProxy] =
      await Promise.all([
        await contracts.mkr.balanceOf(voteProxyAddresses.hotAddress),
        await contracts.mkr.balanceOf(voteProxyAddresses.coldAddress),
        await contracts.chief.deposits(voteProxyAddresses.hotAddress),
        await contracts.chief.deposits(voteProxyAddresses.coldAddress),
        await contracts.chief.deposits(voteProxyAddresses.voteProxyAddress)
      ]);

    return {
      walletBalanceHot,
      walletBalanceCold,
      chiefBalanceHot,
      chiefBalanceCold,
      chiefBalanceProxy,
      chiefTotal: chiefBalanceHot.add(chiefBalanceCold).add(chiefBalanceProxy),
      total: walletBalanceHot
        .add(walletBalanceCold)
        .add(chiefBalanceHot)
        .add(chiefBalanceCold)
        .add(chiefBalanceProxy)
    };
  }

  // otherwise, not proxy or delegate, get connected wallet balances
  const walletBalanceHot = await contracts.mkr.balanceOf(address);
  const chiefBalanceHot = await contracts.chief.deposits(address);
  return {
    walletBalanceHot,
    chiefBalanceHot,
    chiefTotal: chiefBalanceHot,
    total: walletBalanceHot.add(chiefBalanceHot)
  };
}
