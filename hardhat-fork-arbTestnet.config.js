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
      // mining: {
      //   auto: false,
      //   interval: 0
      // },
      // mining: {
      //   auto: false,
      //   interval: 3000
      // },
      forking: {
        url: 'https://arb-goerli.g.alchemy.com/v2/rN1vSB6tSdjfWGno6SSZdjOB8m8LvM_0',
        blockNumber: 734148,
        chainId: 421613
      },
      timeout: 2000000
    }
  }
};
