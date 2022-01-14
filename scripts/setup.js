const hre = require('hardhat');
const { ethers } = hre;

const keyPairs = require('../cypress/support/constants/keypairs.json');
const ERC20_ABI = require('../cypress/fixtures/erc20_abi.json');

async function main() {
  const accounts = await hre.ethers.getSigners();
  const testAccount = '0x8028Ef7ADA45AA7fa31EdaE7d6C30BfA5fb3cf0B';
  // Impersonate accounts
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [accounts[0].address]
  });

  // This is the test account used on the tests
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [testAccount]
  });

  // Send 0.5 ETH to all addresses
  for (let i = 0; i < 50; i++) {
    const signer = await ethers.getSigner(accounts[0].address);
    await signer.sendTransaction({
      to: keyPairs.addresses[i],
      value: ethers.utils.parseEther('0.5')
    });
  }

  console.log('All addresses have now 0.5 ETH');

  const signer = await ethers.getSigner(testAccount);

  const mkrToken = new ethers.Contract('0xc5E4eaB513A7CD12b2335e8a0D57273e13D499f7', ERC20_ABI, signer);

  // Send 0.01 MKR to all addresses
  for (let i = 0; i < 50; i++) {
    await mkrToken.transfer(keyPairs.addresses[i], ethers.utils.parseEther('0.01'));
  }

  console.log('All addresses have now 0.01 MKR');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
