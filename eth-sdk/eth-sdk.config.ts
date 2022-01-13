import type { EthSdkConfig } from '@dethcrypto/eth-sdk';

const config: EthSdkConfig = {
  contracts: {
    mainnet: {
      dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
      mkr: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      pot: '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7'
    },
    goerli: {
      dai: '0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844',
      mkr: '0xc5e4eab513a7cd12b2335e8a0d57273e13d499f7',
      pot: '0x50672F0a14B40051B65958818a7AcA3D54Bd81Af'
    }
  }
};

export default config;
