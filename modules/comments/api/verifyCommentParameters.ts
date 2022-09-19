import { ethers } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import invariant from 'tiny-invariant';
import { getNonce, removeNonces } from './nonce';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';

export async function verifyCommentParameters(
  hotAddress: string,
  voterAddress: string,
  signedMessage: string,
  txHash: string,
  network: SupportedNetworks
): Promise<'delegate' | 'proxy' | 'normal'> {
  invariant(hotAddress && hotAddress.length > 0, 'Invalid voter address');
  invariant(network && network.length > 0, 'Network not supported');
  invariant(txHash && txHash.length > 0, 'Missing verification data');

  // Check nonce exist in db
  // Returns the address + uuid
  const nonceDB = await getNonce(hotAddress);

  // Missing nonce means that someone is trying to send a message without the api generating a valid nonce first
  invariant(!!nonceDB, 'Invalid data');

  // verify signature ownership and check that the signed nonce corresponds to the one in db
  invariant(
    ethers.utils.verifyMessage(nonceDB.nonce, signedMessage).toLowerCase() ===
      ethers.utils.getAddress(hotAddress).toLowerCase(),
    'invalid message signature'
  );

  // Verify that the voter address is either the hotAddress, the vote delegate address or the vote proxy address
  const contracts = getContracts(networkNameToChainId(network), undefined, undefined, true);

  const [proxyAddressCold, proxyAddressHot] = await Promise.all([
    contracts.voteProxyFactory.coldMap(hotAddress),
    contracts.voteProxyFactory.hotMap(hotAddress)
  ]);

  // We get the vote proxy address and verify that, in case that it exists, is equal to the voter address
  let voteProxyAddress = '';

  // if account belongs to a hot or cold map, get proxy contract address
  if (proxyAddressCold !== ZERO_ADDRESS) {
    voteProxyAddress = proxyAddressCold;
  } else if (proxyAddressHot !== ZERO_ADDRESS) {
    voteProxyAddress = proxyAddressHot;
  }

  const vdAddress = await getDelegateContractAddress(contracts, hotAddress);

  const voterAddressIsNotRelatedToHotAddress =
    voterAddress.toLowerCase() !== voteProxyAddress.toLowerCase() &&
    voterAddress.toLowerCase() !== vdAddress?.toLowerCase() &&
    voterAddress.toLowerCase() !== hotAddress.toLowerCase();

  invariant(!voterAddressIsNotRelatedToHotAddress, 'Invalid voting address');

  // Validation is good, we delete the nonces for this address
  await removeNonces(hotAddress);

  return vdAddress ? 'delegate' : voteProxyAddress ? 'proxy' : 'normal';
}
