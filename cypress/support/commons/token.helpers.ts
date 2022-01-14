import ERC20_ABI from '../../fixtures/erc20_abi.json';
import { GOERLI_ADDRESSES } from 'modules/contracts/constract.constants';
import { ethers } from 'ethers';
import { TEST_ACCOUNTS } from '../constants/testaccounts';

export async function sendMKR(accountTo: string, amount: number) {
  const _url = 'http://localhost:8545';
  const provider = ethers.getDefaultProvider(_url);

  // @ts-ignore
  const signer = new ethers.Wallet(TEST_ACCOUNTS.normal.key, provider);

  const token = new ethers.Contract(GOERLI_ADDRESSES.GOV, ERC20_ABI, signer);
  await token.transfer(accountTo, ethers.utils.parseEther(amount.toString()));
}

export async function sendETH(accountTo: string, amount: number) {
  const _url = 'http://localhost:8545';
  const provider = ethers.getDefaultProvider(_url);

  // Increase nonce
  const accountNonce =
    '0x' + ((await provider.getTransactionCount(TEST_ACCOUNTS.normal.address)) + 1).toString(16);
  // @ts-ignore
  const signer = new ethers.Wallet(TEST_ACCOUNTS.normal.key, provider);
  await signer.sendTransaction({
    to: accountTo,
    value: ethers.utils.parseEther(amount.toString()),
    nonce: accountNonce
  });
}
