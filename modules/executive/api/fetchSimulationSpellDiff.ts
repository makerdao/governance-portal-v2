import { fetchJson } from 'lib/fetchJson';
import {
  SIGNATURE_CAST,
  SIMULATE_TX_ENDPOINT,
  SIMULATE_TX_FROM,
  SIMULATE_TX_GAS,
  SIMULATE_TX_GAS_PRICE,
  SIMULATE_TX_VALUE
} from 'modules/web3/constants/networks';
import { validateDiff } from '../helpers/spellDiffParsers';
import { SimulationDiffAPIResponse, SpellDiff } from '../types';
// import { validateDiff } from '../helpers/spellDiffParsers';
// import { SimulationDiffAPIResponse, SpellDiff } from '../types';

type Response = Record<'diffs', SimulationDiffAPIResponse[]>;

export async function fetchSimulationSpellDiffs(proposalAddress: string): Promise<SpellDiff[]> {
  // proposalAddress = '0x82b24156f0223879aaac2dd0996a25fe1ff74e1a'; // the demo spell address
  proposalAddress = '0x068F8fb8318506bFbaD57B494A0c7b31399f4Ed6'; // spell address 3/11

  // TODO: this probably needs to be the block number where it's eligible to be executed
  // If no executeOnTopOfBlockNumber is provided - transaction will be simulated on top of the head block
  const blockNumber = '14366830'; // 3/11 block executed

  const paramsData = {
    from_address: SIMULATE_TX_FROM,
    to_address: proposalAddress,
    data: SIGNATURE_CAST,
    gas: SIMULATE_TX_GAS,
    gas_price: SIMULATE_TX_GAS_PRICE,
    execute_on_top_of_block_number: blockNumber,
    value: SIMULATE_TX_VALUE
  };

  const searchParams = new URLSearchParams(paramsData);
  const url = new URL(SIMULATE_TX_ENDPOINT);
  url.search = searchParams.toString();

  const { diffs } = (await fetchJson(url.toString())) as Response;
  const validated = diffs.map(diff => validateDiff(diff));

  return validated;
}
