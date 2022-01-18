// @ts-nocheck

require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
require('@nomiclabs/hardhat-ethers');


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {

  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      timeout: 2000000,
      chainId: 31337
    },

    hardhat: {
      forking: {
        url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
        blockNumber: 6182224,
        chainId: 31337
      },
      timeout: 2000000
    }
  },
  
};
