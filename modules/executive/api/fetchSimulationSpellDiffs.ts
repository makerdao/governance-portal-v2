import { fetchJson } from 'lib/fetchJson';
import { validateDiff } from '../helpers/spellDiffParsers';
import { SimulationDiffAPIResponse, SpellDiff } from '../types';
import {
  SIMULATE_TX_ENDPOINT,
  SIMULATE_TX_GAS,
  SIMULATE_TX_GAS_PRICE,
  SIGNATURE_CAST,
  SIMULATE_TX_VALUE,
  SIMULATE_TX_FROM
} from 'lib/constants';

type Response = Record<'diffs', SimulationDiffAPIResponse[]>;

export async function fetchSimulationSpellDiffs(proposalAddress: string): Promise<SpellDiff[]> {
  proposalAddress = '0x82b24156f0223879aaac2dd0996a25fe1ff74e1a'; // the spell address
  const execute_on_top_of_block_number = 13624481; // from example. could be current block, eh?
  // const timestamp = 1637047755; // 11/15 5:29pm mst doesn't appear to be required

  // May not need blocknumber once the API is fixed:
  // If no executeOnTopOfBlockNumber is provided - transaction will be simulated on top of the head block

  const url = `${SIMULATE_TX_ENDPOINT}/?from_address=${SIMULATE_TX_FROM}&to_address=${proposalAddress}&data=${SIGNATURE_CAST}&gas=${SIMULATE_TX_GAS}&gas_price=${SIMULATE_TX_GAS_PRICE}&execute_on_top_of_block_number=${execute_on_top_of_block_number}&value=${SIMULATE_TX_VALUE}`;
  const { diffs } = <Response>await fetchJson(url);
  const validated = diffs.map(diff => validateDiff(diff));
  return validated;
}
