import { fetchJson } from 'lib/fetchJson';
import { validateDiff, formatLocation, formatValue } from '../helpers/spellDiffParsers';

export async function fetchSimulationSpellDiffs() {
  const from_address = '0x5cab1e5286529370880776461c53a0e47d74fb63'; // Think its just the caster of the spell, could be anyone?
  const to_address = '0x82b24156f0223879aaac2dd0996a25fe1ff74e1a'; // the spell address
  // const data = data2;
  const data = '0x96d373e5'; // The spell signature can also be pulled from the interface but should always be "cast" right?
  const gas = '0x1c6b9e'; // from the example, should see if we can get it dynamically
  const gas_price = '0x23bd501f00';
  const execute_on_top_of_block_number = 13624481; // from example. could be current block, eh?
  // const timestamp = 1637047755; // 11/15 5:29pm mst
  const value = 0; // think its always 0 in our case

  const ip = '18.157.179.179';
  const url = `http://${ip}/api/v1/transactions/simulation/?from_address=${from_address}&to_address=${to_address}&data=${data}&gas=${gas}&gas_price=${gas_price}&execute_on_top_of_block_number=${execute_on_top_of_block_number}&value=${value}`;
  const { diffs } = await fetchJson(url);
  const validated = diffs.map(diff => validateDiff(diff));
  return validated;
}
