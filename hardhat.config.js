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
            jsonRpcUrl: process.env.GOERLI_FORK_API_KEY,
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
    goerli: {
      url: 'http://127.0.0.1:8545',
      timeout: 2000000,
      chainId: 31337
    },
    arbTestnet: {
      url: 'http://127.0.0.1:8546',
      timeout: 2000000,
      chainId: 521613
    },
    hardhat: {
      mining: {
        auto: false,
        interval: 3000
      },
      timeout: 2000000
    }
  }
};
