const hre = require('hardhat');
const { network } = hre;

async function main() {
  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: `https://arb-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ARBITRUM_TESTNET_KEY}`,
          blockNumber: 793616,
          chainId: 521613
        }
      }
    ]
  });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
