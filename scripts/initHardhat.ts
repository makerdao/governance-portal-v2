// import hre from 'hardhat';
// import { TEST_ACCOUNTS } from '../constants/testaccounts';
// import { ethers } from 'ethers';
// import ERC20_ABI from '../../fixtures/erc20_abi.json';
// import { GOERLI_ADDRESSES } from 'modules/contracts/constract.constants';

// // TODO: We could add this as a script and run it through hardhat after launching the network.

// const ETH_ACCOUNT = {
//   // 1000 ETH
//   address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
//   key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
// };

// export async function initHardhatFork() {
//   // Impersonate accounts
//   await hre.network.provider.request({
//     method: 'hardhat_impersonateAccount',
//     params: [ETH_ACCOUNT.key, TEST_ACCOUNTS.normal.address, TEST_ACCOUNTS.delegate.address]
//   });

//   const _url = 'http://localhost:8545';
//   const provider = ethers.getDefaultProvider(_url);

//   // Send ETH To all wallets
//   // @ts-ignore
//   const ethOwnerSigner = await provider.getSigner(ETH_ACCOUNT.address);
//   await ethOwnerSigner.sendTransaction({
//     to: TEST_ACCOUNTS.normal.address,
//     value: ethers.utils.parseEther('1') // 1 ether
//   });

//   // Get top MKR holder
//   const TOP_HOLDER_ADDRESS = TEST_ACCOUNTS.mkrOwner.address;

//   const token = new ethers.Contract(tokenAddress, ERC20_ABI, topHolderSigner);
//   await token.transfer(TEST_ACCOUNTS.normal.address, ethers.utils.parseEther('1000'));
//   // Send MKR to our accounts
// }
