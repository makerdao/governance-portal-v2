// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {

  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      timeout: 2000000,
      chainId: 1337
    },

    hardhat: {
      forking: {
        url: 'https://eth-goerli.alchemyapi.io/v2/p7bY4ggxW60weHKPiAP7HXN2RNAAQZ8E',
        blockNumber: 6182224,
        chainId: 1337
      },
      timeout: 2000000
    }
  },
  
};
