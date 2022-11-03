// @ts-nocheck

require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-web3');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      chainId: 521613,
      forking: {
        url: `https://arb-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ARBITRUM_TESTNET_KEY}`,
        blockNumber: 793616,
        chainId: 521613
      },
      timeout: 2000000
    }
  }
};
