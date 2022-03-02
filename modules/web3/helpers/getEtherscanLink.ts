import { SupportedChainId } from '../constants/chainID';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from './chain';

export function getEtherscanLink(
  network: SupportedNetworks,
  data: string,
  type: 'transaction' | 'address'
): string {
  const chainId = networkNameToChainId(network);
  const prefix = `https://${
    CHAIN_INFO[chainId].etherscanPrefix || CHAIN_INFO[SupportedChainId.MAINNET].etherscanPrefix
  }etherscan.io`;

  switch (type) {
    case 'transaction':
      return `${prefix}/tx/${data}`;
    case 'address':
    default:
      return `${prefix}/address/${data}`;
  }
}
