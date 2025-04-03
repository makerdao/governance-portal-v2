import { Chain, defineChain } from 'viem';
import tenderlyTestnetData from '../../../tenderlyTestnetData.json';
import { tenderly } from './config.default';
import { config } from 'lib/config';
import { mainnet } from 'viem/chains';

export const getTestTenderlyChain = () => {
  const { TENDERLY_RPC_URL } = tenderlyTestnetData;

  return defineChain({
    id: tenderly.id,
    name: 'Tenderly Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: [TENDERLY_RPC_URL || `https://virtual.mainnet.rpc.tenderly.co/${config.TENDERLY_RPC_KEY}`]
      }
    },
    contracts: mainnet.contracts
  }) as Chain;
};
