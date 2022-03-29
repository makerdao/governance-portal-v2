import { ethers } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import invariant from 'tiny-invariant';
import { getNonce, removeNonces } from './nonce';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getRPCFromChainID } from 'modules/web3/helpers/getRPC';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';

export async function verifyCommentParameters(
  hotAddress: string,
  voterAddress: string,
  signedMessage: string,
  txHash: string,
  network: SupportedNetworks
): Promise<void> {
  invariant(hotAddress && hotAddress.length > 0, 'Invalid voter address');
  invariant(network && network.length > 0, 'Network not supported');
  invariant(txHash && txHash.length > 0, 'Missing verification data');

  const rpcUrl = getRPCFromChainID(networkNameToChainId(network));
  const provider = await new ethers.providers.JsonRpcProvider(rpcUrl);

  // Check nonce exist in db
  // Returns the address + uuid
  const nonceDB = await getNonce(hotAddress);

  // Missing nonce means that someone is trying to send a message without the api generating a valid nonce first
  invariant(!!nonceDB, 'Invalid data');

  // verify tx ownership
  const { from } = await provider.getTransaction(txHash);

  invariant(
    ethers.utils.getAddress(from).toLowerCase() === ethers.utils.getAddress(hotAddress).toLowerCase(),
    "invalid 'from' address"
  );

  // verify signature ownership and check that the signed nonce corresponds to the one in db
  invariant(
    ethers.utils.verifyMessage(nonceDB.nonce, signedMessage).toLowerCase() ===
      ethers.utils.getAddress(hotAddress).toLowerCase(),
    'invalid message signature'
  );

  // Verify that the voter address is either the hotAddress, the vote delegate address or the vote proxy address
  const contracts = getContracts(networkNameToChainId(network));

  const voteProxyAddress = await getVoteProxyAddresses(contracts.voteProxyFactory, hotAddress, network);

  const vdAddress = await contracts.voteDelegateFactory.delegates(hotAddress);

  const voterAddressIsNotRelatedToHotAddress =
    voterAddress.toLowerCase() !== voteProxyAddress.coldAddress?.toLowerCase() &&
    voterAddress.toLowerCase() !== voteProxyAddress.hotAddress?.toLowerCase() &&
    voterAddress.toLowerCase() !== vdAddress?.toLowerCase() &&
    voterAddress.toLowerCase() !== hotAddress.toLowerCase();

  invariant(!voterAddressIsNotRelatedToHotAddress, 'Invalid voting address');

  // Validation is good, we delete the nonces for this address
  await removeNonces(hotAddress);
}
