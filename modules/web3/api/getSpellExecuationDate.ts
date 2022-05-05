import { getContracts } from 'modules/web3/helpers/getContracts';
import { DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from '../helpers/chain';
import { getSpellContract } from 'modules/web3/helpers/getSpellContract';
import contractInfo from '../helpers/contract-info.json';
import { getDefaultProvider } from '../helpers/getDefaultProvider';
const pauseInfo = contractInfo.pause;

export const getSpellExecutionDate = async (
  spellAddress: string,
  network?: SupportedNetworks
): Promise<Date | undefined> => {
  const chainId = networkNameToChainId(network || DEFAULT_NETWORK.network);
  const contracts = getContracts(chainId, undefined, undefined, true);

  const provider = getDefaultProvider(network);

  const spellContract = getSpellContract(spellAddress, network || DEFAULT_NETWORK.network);

  const done = await spellContract.done();

  if (!done) return undefined;

  const pauseContract = contracts['pause'];

  const string = spellAddress.replace(/^0x/, '');

  const paddedSpellAddress = '0x' + string.padStart(64, '0');

  const [execEvent] = await provider.getLogs({
    fromBlock: parseInt(pauseInfo.inception_block[network || DEFAULT_NETWORK.network]),
    toBlock: 'latest',
    address: pauseContract.address,
    topics: [pauseInfo.events.exec, paddedSpellAddress]
  });

  const { timestamp } = await provider.getBlock(execEvent.blockNumber);

  return new Date(timestamp * 1000);
};
