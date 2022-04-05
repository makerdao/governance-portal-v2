import { ethers } from 'ethers';
import { fetchJson } from 'lib/fetchJson';
import { DECODED_SPELL_ENDPOINT, SIGNATURE_CAST, SupportedNetworks } from 'modules/web3/constants/networks';
import { validateDiff } from '../helpers/spellDiffParsers';
import { DecodedDiffAPIResponse, SpellDiff } from '../types';
import { config } from 'lib/config';
// import { validateDiff } from '../helpers/spellDiffParsers';
// import { DecodedDiffAPIResponse, SpellDiff } from '../types';

export async function fetchHistoricalSpellDiff(proposalAddress?: string): Promise<SpellDiff[]> {
  if (!proposalAddress) return [];

  // Need to find the tx of the cast spell
  const provider = new ethers.providers.EtherscanProvider(SupportedNetworks.MAINNET, config.ETHERSCAN_KEY);
  const history = await provider.getHistory(proposalAddress);
  const castTx = history.filter(h => h.data === SIGNATURE_CAST);

  if (castTx.length > 0) {
    // Sometimes the 'cast()' tx fails, so there will be more than one. Always take the last index because it's the one that succeeded.
    const { hash } = castTx[castTx.length - 1];

    const url = DECODED_SPELL_ENDPOINT(hash);

    try {
      const diffs: DecodedDiffAPIResponse[] = await fetchJson(url);
      const validated = diffs.map(diff => validateDiff(diff));
      return validated;
    } catch (e) {
      console.warn(`Error fetching historical spell diffs for ${proposalAddress}:`, e.message);
      return [];
    }
  }
  return [];
}
