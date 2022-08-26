import { BigNumber } from '@ethersproject/bignumber';
import { hexStripZeros } from '@ethersproject/bytes';
import { Chain } from '../types/chain';

export function connectToNetwork(chain: Chain, ethereum: any): Promise<any> {
  const params = {
    chainId: hexStripZeros(BigNumber.from(chain.chainId).toHexString()), // A 0x-prefixed hexadecimal string

    rpcUrls: [chain.rpcs[chain.defaultRpc]]
  };

  return ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [params]
  });
}
