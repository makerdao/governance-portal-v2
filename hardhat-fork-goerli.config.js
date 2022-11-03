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
      chainId: 31337,
      forking: {
        url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY_HH}`,
        blockNumber: 7810464, // One block after a particular poll was created
        chainId: 31337
      },
      timeout: 2000000
    }
  }
};
