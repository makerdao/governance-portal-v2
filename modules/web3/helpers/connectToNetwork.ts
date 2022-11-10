import { BigNumber } from '@ethersproject/bignumber';
import { hexStripZeros } from '@ethersproject/bytes';
import { SupportedChain } from '../types/chain';

export function connectToNetwork(chain: SupportedChain, ethereum: any): Promise<any> {
  const params = {
    chainId: hexStripZeros(BigNumber.from(chain.chainId).toHexString()), // A 0x-prefixed hexadecimal string

    rpcUrls: [chain.rpcs[chain.defaultRpc]]
  };

  return ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [params]
  });
}
