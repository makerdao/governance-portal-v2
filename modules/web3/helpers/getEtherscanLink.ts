import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from './chain';

//todo: change name to getBlockExplorerLink
export function getEtherscanLink(
  network: SupportedNetworks,
  data: string,
  type: 'transaction' | 'address'
): string {
  const chainId = networkNameToChainId(network);
  const prefix = `https://${CHAIN_INFO[chainId].blockExplorerUrl}`;

  switch (type) {
    case 'transaction':
      return `${prefix}/tx/${data}`;
    case 'address':
    default:
      return `${prefix}/address/${data}`;
  }
}
