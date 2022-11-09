const hre = require('hardhat');
const { network } = hre;

async function main() {
  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY_HH}`,
          blockNumber: 7810464, // One block after a particular poll was created
          chainId: 31337
        }
      }
    ]
  });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
