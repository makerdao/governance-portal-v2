import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { Tokens } from 'modules/web3/constants/tokens';
import { BigNumber } from 'ethers';

export async function fetchMkrInChief(network?: SupportedNetworks): Promise<BigNumber> {
  const chainId = network ? networkNameToChainId(network) : networkNameToChainId(SupportedNetworks.MAINNET);
  const contracts = getContracts({
    chainId,
    library: undefined,
    account: undefined,
    readOnly: true
  });
  const chiefAddress = await contracts.chief.address;
  const tokenContract = contracts[Tokens.MKR];
  const mkrInChief = await tokenContract.balanceOf(chiefAddress);

  return mkrInChief;
}
