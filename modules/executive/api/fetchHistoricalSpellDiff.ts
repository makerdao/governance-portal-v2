import { ethers } from 'ethers';
import { fetchJson } from 'lib/fetchJson';
import { DECODED_SPELL_ENDPOINT, SIGNATURE_CAST, SupportedNetworks } from 'modules/web3/constants/networks';
import { validateDiff } from '../helpers/spellDiffParsers';
import { DecodedDiffAPIResponse, SpellDiff } from '../types';
import { config } from 'lib/config';
// import { validateDiff } from '../helpers/spellDiffParsers';
// import { DecodedDiffAPIResponse, SpellDiff } from '../types';

export async function fetchHistoricalSpellDiff(proposalAddress: string): Promise<SpellDiff[]> {
  if (!proposalAddress) return [];

  // Need to find the tx of the cast spell
  const provider = new ethers.providers.EtherscanProvider(SupportedNetworks.MAINNET, config.ETHERSCAN_KEY);
  const history = await provider.getHistory(proposalAddress);
  const castTx = history.filter(h => h.data === SIGNATURE_CAST);

  if (castTx.length > 1) {
    // TODO: Need to loop & fetch the txns from the provider to find the successful one
    console.warn('multiple matching txs', castTx);
  }
  const [{ hash }] = castTx;

  const url = DECODED_SPELL_ENDPOINT(hash);

  const diffs: DecodedDiffAPIResponse[] = await fetchJson(url);
  const validated = diffs.map(diff => validateDiff(diff));

  return validated;
}
