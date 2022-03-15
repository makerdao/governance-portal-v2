// @ts-nocheck

require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-web3');

task('fork', 'Forks network at the specified block')
  .addParam('block', 'The block number to fork from')
  .setAction(async taskArgs => {
    await hre.network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
            blockNumber: parseInt(taskArgs.block)
          }
        }
      ]
    });
  });

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
        blockNumber: 6349521,
        chainId: 31337
      },
      timeout: 2000000
    }
  }
};
