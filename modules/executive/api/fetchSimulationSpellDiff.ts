import { fetchJson } from 'lib/fetchJson';
import logger from 'lib/logger';
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

type Response = Record<'diffs', SimulationDiffAPIResponse[]>;

type ParamsData = {
  from_address: string;
  to_address: string;
  data: string;
  gas: string;
  gas_price: string;
  value: string;
  timestamp?: string;
};

export async function fetchSimulationSpellDiffs(
  proposalAddress: string,
  nextCastTime: number
): Promise<SpellDiff[]> {
  const paramsData: ParamsData = {
    from_address: SIMULATE_TX_FROM,
    to_address: proposalAddress,
    data: SIGNATURE_CAST,
    gas: SIMULATE_TX_GAS,
    gas_price: SIMULATE_TX_GAS_PRICE,
    value: SIMULATE_TX_VALUE
  };

  // If nextCastTime is in the future, send it along with the request, otherwise let the endpoint use it's default value
  if (nextCastTime > new Date().getTime()) paramsData.timestamp = (nextCastTime / 1000).toString();

  const searchParams = new URLSearchParams(paramsData);
  const url = new URL(SIMULATE_TX_ENDPOINT);
  url.search = searchParams.toString();

  try {
    const { diffs } = (await fetchJson(url.toString())) as Response;
    const validated = diffs.map(diff => validateDiff(diff));

    return validated;
  } catch (e) {
    logger.error('fetchSimulationSpellDiffs: Error fetching simulated spell diffs:', e.message);
    return [];
  }
}
