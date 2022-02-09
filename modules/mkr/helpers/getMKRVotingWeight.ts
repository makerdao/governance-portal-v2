import { BigNumber } from 'ethers';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';

export type MKRVotingWeightResponse = {
  mkrBalance: BigNumber;
  chiefBalance: BigNumber;
  linkedMkrBalance?: BigNumber;
  linkedChiefBalance?: BigNumber;
  proxyChiefBalance?: BigNumber;
  total: BigNumber;
};
// Returns the voting weigth for an address. It checks if it has a delegate contract or a vote proxy
export async function getMKRVotingWeight(
  address: string,
  network: SupportedNetworks
): Promise<MKRVotingWeightResponse> {
  const contracts = getContracts(networkNameToChainId(network));

  const voteDelegateAddress = await contracts.voteDelegateFactory.delegates(address);

  if (voteDelegateAddress && voteDelegateAddress !== ZERO_ADDRESS) {
    const mkrDelegate = await contracts.mkr.balanceOf(voteDelegateAddress);
    const mkrChiefDelegate = await contracts.chief.deposits(voteDelegateAddress);
    return {
      mkrBalance: mkrDelegate,
      chiefBalance: mkrChiefDelegate,
      total: mkrDelegate.add(mkrChiefDelegate)
    };
  }

  const voteProxyAddresses = await getVoteProxyAddresses(contracts.voteProxyFactory, address, network);

  const mkrInAddress = await contracts.mkr.balanceOf(address);
  const mkrInChief = await contracts.chief.deposits(address);

  if (
    voteProxyAddresses.voteProxyAddress &&
    voteProxyAddresses.coldAddress &&
    voteProxyAddresses.hotAddress
  ) {
    const otherAddress =
      address.toLowerCase() === voteProxyAddresses.hotAddress?.toLowerCase()
        ? voteProxyAddresses.coldAddress
        : voteProxyAddresses.hotAddress;

    const mkrOtherAddress = await contracts.mkr.balanceOf(otherAddress);
    const mkrChiefOtherAddress = await contracts.chief.deposits(otherAddress);
    const mkrProxyAddress = await contracts.chief.deposits(voteProxyAddresses.voteProxyAddress);

    // If vote proxy, return balances in all the wallets
    return {
      mkrBalance: mkrInAddress,
      chiefBalance: mkrInChief,
      linkedMkrBalance: mkrOtherAddress,
      linkedChiefBalance: mkrChiefOtherAddress,
      proxyChiefBalance: mkrProxyAddress,
      total: mkrInAddress.add(mkrInChief).add(mkrOtherAddress).add(mkrChiefOtherAddress).add(mkrProxyAddress)
    };
  }

  return {
    mkrBalance: mkrInAddress,
    chiefBalance: mkrInChief,
    total: mkrInAddress.add(mkrInChief)
  };
}
