import type { EthSdkConfig } from '@dethcrypto/eth-sdk';

const config: EthSdkConfig = {
  contracts: {
    mainnet: {
      chief: '0x0a3f6849f78076aefaDf113F5BED87720274dDC0',
      dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
      mkr: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      pot: '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7',
      vat: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B',
      vow: '0xA950524441892A31ebddF91d3cEEFa04Bf454466'
    },
    goerli: {
      chief: '0x33Ed584fc655b08b2bca45E1C5b5f07c98053bC1',
      dai: '0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844',
      mkr: '0xc5e4eab513a7cd12b2335e8a0d57273e13d499f7',
      pot: '0x50672F0a14B40051B65958818a7AcA3D54Bd81Af',
      vat: '0xB966002DDAa2Baf48369f5015329750019736031',
      vow: '0x23f78612769b9013b3145E43896Fa1578cAa2c2a'
    }
  }
};

export default config;
