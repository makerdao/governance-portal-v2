import type { EthSdkConfig } from '@dethcrypto/eth-sdk';

const config: EthSdkConfig = {
  contracts: {
    mainnet: {
      chief: '0x0a3f6849f78076aefaDf113F5BED87720274dDC0',
      dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
      esm: '0x29CfBd381043D00a98fD9904a431015Fef07af2f',
      iou: '0xa618e54de493ec29432ebd2ca7f14efbf6ac17f7',
      mkr: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      polling: '0xF9be8F0945acDdeeDaA64DFCA5Fe9629D0CF8E5D',
      pot: '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7',
      vat: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B',
      voteDelegateFactory: '0xD897F108670903D1d6070fcf818f9db3615AF272',
      voteProxyFactory: '0x6FCD258af181B3221073A96dD90D1f7AE7eEc408',
      vow: '0xA950524441892A31ebddF91d3cEEFa04Bf454466'
    },
    goerli: {
      chief: '0x33Ed584fc655b08b2bca45E1C5b5f07c98053bC1',
      dai: '0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844',
      esm: '0x105BF37e7D81917b6fEACd6171335B4838e53D5e',
      iou: '0x651D1B91e4F657392a51Dba7A6A1A1a72eC6aD1c',
      mkr: '0xc5e4eab513a7cd12b2335e8a0d57273e13d499f7',
      polling: '0xdbE5d00b2D8C13a77Fb03Ee50C87317dbC1B15fb',
      pot: '0x50672F0a14B40051B65958818a7AcA3D54Bd81Af',
      vat: '0xB966002DDAa2Baf48369f5015329750019736031',
      voteDelegateFactory: '0xE2d249AE3c156b132C40D07bd4d34e73c1712947',
      voteProxyFactory: '0x1a7c1ee5eE2A3B67778ff1eA8c719A3fA1b02b6f',
      vow: '0x23f78612769b9013b3145E43896Fa1578cAa2c2a'
    }
  }
};

export default config;
