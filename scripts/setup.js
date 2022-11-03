const hre = require('hardhat');
const { ethers } = hre;

const keyPairs = require('../cypress/support/constants/keypairs.json');
const ERC20_ABI = require('../cypress/fixtures/erc20_abi.json');

async function main() {
  const accounts = await hre.ethers.getSigners();
  const testAccount = '0x8028Ef7ADA45AA7fa31EdaE7d6C30BfA5fb3cf0B';
  const mkrAddress = '0xc5E4eaB513A7CD12b2335e8a0D57273e13D499f7';

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

  const ethSender = await ethers.getSigner(accounts[0].address);
  // Send 0.5 ETH to all addresses
  for (let i = 0; i < 50; i++) {
    await ethSender.sendTransaction({
      to: keyPairs.addresses[i],
      value: ethers.utils.parseEther('0.5')
    });
  }
  console.log('Imported accounts have been sent 0.5 ETH');

  await ethSender.sendTransaction({
    to: testAccount,
    value: ethers.utils.parseEther('2.5')
  });

  console.log(
    'testAcct ETH balance is now',
    ethers.utils.formatEther(await ethers.provider.getBalance(testAccount))
  );

  const signer = await ethers.getSigner(testAccount);

  const mkrToken = new ethers.Contract(mkrAddress, ERC20_ABI, signer);

  // Send 0.01 MKR to all addresses
  for (let i = 0; i < 10; i++) {
    await mkrToken.transfer(keyPairs.addresses[i], ethers.utils.parseEther('0.01'));
  }

  console.log('Imported accounts have been sent 0.01 MKR');

  //manipulate mkr contract, give test address 250K MKR
  //https://kndrck.co/posts/local_erc20_bal_mani_w_hh/

  const toBytes32 = bn => {
    return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
  };

  const setStorageAt = async (address, index, value) => {
    await ethers.provider.send('hardhat_setStorageAt', [address, index, value]);
    await ethers.provider.send('evm_mine', []);
  };

  const MKR_SLOT = 3;
  const index = ethers.utils.solidityKeccak256(['uint256', 'uint256'], [testAccount, MKR_SLOT]);
  const indexForHHAcct = ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [accounts[1].address, MKR_SLOT]
  );

  await setStorageAt(mkrAddress, index.toString(), toBytes32(ethers.utils.parseUnits('250000')).toString());
  await setStorageAt(
    mkrAddress,
    indexForHHAcct.toString(),
    toBytes32(ethers.utils.parseUnits('2.3')).toString()
  );

  const mkrBalanceA = await mkrToken.balanceOf(testAccount);
  console.log(`testAccount now has ${ethers.utils.formatUnits(mkrBalanceA)} MKR`);

  const mkrBalanceB = await mkrToken.balanceOf(accounts[1].address);
  console.log(
    `hardhat account (${accounts[1].address}) now has ${ethers.utils.formatUnits(mkrBalanceB)} MKR`
  );

  // Create delegate contract
  // const delegateAddress = '0x81431b69b1e0e334d4161a13c2955e0f3599381e'
  // await hre.network.provider.request({
  //   method: 'hardhat_impersonateAccount',
  //   params: [delegateAddress]
  // });

  // const delegateSigner = await ethers.getSigner(delegateAddress);
  // const voteDelegateFactory = new ethers.Contract('0xE2d249AE3c156b132C40D07bd4d34e73c1712947', VOTEDELEGATE_ABI, delegateSigner);
  // await voteDelegateFactory.create();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
