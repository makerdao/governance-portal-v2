import { fetchJson } from 'lib/fetchJson';
import {
  AVG_BLOCKS_PER_DAY,
  SIGNATURE_CAST,
  SIMULATE_TX_ENDPOINT,
  SIMULATE_TX_FROM,
  SIMULATE_TX_GAS,
  SIMULATE_TX_GAS_PRICE,
  SIMULATE_TX_VALUE,
  SupportedNetworks
} from 'modules/web3/constants/networks';
import { validateDiff } from '../helpers/spellDiffParsers';
import { SimulationDiffAPIResponse, SpellDiff } from '../types';
import { differenceInDays } from 'date-fns';
import { getDefaultProvider } from 'ethers';
// import { validateDiff } from '../helpers/spellDiffParsers';
// import { SimulationDiffAPIResponse, SpellDiff } from '../types';

type Response = Record<'diffs', SimulationDiffAPIResponse[]>;

type ParamsData = {
  from_address: string;
  to_address: string;
  data: string;
  gas: string;
  gas_price: string;
  value: string;
  execute_on_top_of_block_number?: string;
};

export async function fetchSimulationSpellDiffs(
  proposalAddress: string,
  nextCastTime: string,
  network: SupportedNetworks
): Promise<SpellDiff[]> {
  const paramsData: ParamsData = {
    from_address: SIMULATE_TX_FROM,
    to_address: proposalAddress,
    data: SIGNATURE_CAST,
    gas: SIMULATE_TX_GAS,
    gas_price: SIMULATE_TX_GAS_PRICE,
    value: SIMULATE_TX_VALUE
  };

  // Estimate the block number when the spell can be cast
  if (nextCastTime) {
    const provider = getDefaultProvider(network);
    const currentBlock = await provider.getBlockNumber();
    const daysUntilCast = differenceInDays(new Date(nextCastTime), Date.now());
    const blocksToAdd = AVG_BLOCKS_PER_DAY * daysUntilCast;
    const blockNumber = currentBlock + blocksToAdd;

    paramsData.execute_on_top_of_block_number = blockNumber.toString();
  }

  const searchParams = new URLSearchParams(paramsData);
  const url = new URL(SIMULATE_TX_ENDPOINT);
  url.search = searchParams.toString();

  try {
    const { diffs } = (await fetchJson(url.toString())) as Response;
    const validated = diffs.map(diff => validateDiff(diff));

    return validated;
  } catch (e) {
    console.error('Error fetching simulated spell diffs:', e.message);
    return [];
  }
}
