import { CHAIN_INFO, GASLESS_CHAIN_INFO, GaslessNetworks, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from './chain';

//todo: change name to getBlockExplorerLink
export function getEtherscanLink(
  network: SupportedNetworks | GaslessNetworks,
  data: string,
  type: 'transaction' | 'address'
): string {
  console.log('network', network);
  const chainId = networkNameToChainId(network);
  const ALL_CHAINS = { ...CHAIN_INFO, ...GASLESS_CHAIN_INFO };
  const prefix = `https://${ALL_CHAINS[chainId].blockExplorerUrl}`;

  switch (type) {
    case 'transaction':
      return `${prefix}/tx/${data}`;
    case 'address':
    default:
      return `${prefix}/address/${data}`;
  }
}
