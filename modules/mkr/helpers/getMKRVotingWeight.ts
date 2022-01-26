import { BigNumber } from 'ethers';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';

// Returns the voting weigth for an address. It checks if it has a delegate contract or a vote proxy
export async function getMKRVotingWeight(address: string, network: SupportedNetworks): Promise<BigNumber> {
  const contracts = getContracts(networkNameToChainId(network));

  const voteDelegateAddress = await contracts.voteDelegateFactory.delegates(address);

  if (voteDelegateAddress) {
    const mkrDelegate = await contracts.mkr.balanceOf(voteDelegateAddress);
    const mkrChiefDelegate = await contracts.chief.deposits(voteDelegateAddress);
    return mkrDelegate.add(mkrChiefDelegate);
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
    return mkrInAddress.add(mkrInChief).add(mkrOtherAddress).add(mkrChiefOtherAddress).add(mkrProxyAddress);
  }

  return mkrInAddress.add(mkrInChief);
}
