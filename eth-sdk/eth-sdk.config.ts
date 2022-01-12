import type { EthSdkConfig } from '@dethcrypto/eth-sdk';

const config: EthSdkConfig = {
  contracts: {
    mainnet: {
      dai: '0x6b175474e89094c44da98b954eedeac495271d0f'
    },
    goerli: {
      mkr: '0xc5e4eab513a7cd12b2335e8a0d57273e13d499f7'
    }
  }
};

export default config;
