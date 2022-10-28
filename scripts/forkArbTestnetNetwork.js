const hre = require('hardhat');
const { network } = hre;

async function main() {
  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: 'https://arb-goerli.g.alchemy.com/v2/rN1vSB6tSdjfWGno6SSZdjOB8m8LvM_0',
          blockNumber: 793616,
          chainId: 421613
        }
      }
    ]
  });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
