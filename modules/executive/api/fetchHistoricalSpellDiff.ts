import { ethers } from 'ethers';
import { fetchJson } from 'lib/fetchJson';
import { DECODED_SPELL_ENDPOINT, SIGNATURE_CAST } from 'modules/web3/constants/networks';
import { validateDiff } from '../helpers/spellDiffParsers';
import { DecodedDiffAPIResponse, SpellDiff } from '../types';
// import { validateDiff } from '../helpers/spellDiffParsers';
// import { DecodedDiffAPIResponse, SpellDiff } from '../types';

export async function fetchHistoricalSpellDiff(proposalAddress: string): Promise<SpellDiff[]> {
  if (!proposalAddress) return [];

  // Need to find the tx of the cast spell
  // TODO: is there a backup procedure we could use to get the hash?
  const provider = new ethers.providers.EtherscanProvider();
  const history = await provider.getHistory(proposalAddress);
  const castTx = history.filter(h => h.data === SIGNATURE_CAST);

  if (castTx.length > 1) {
    // TODO: Need to loop & fetch the txns from the provider to find the successful one
    console.warn('multiple matching txs', castTx);
  }
  const [{ hash }] = castTx;
  console.log('transaction hash for decoding spell', hash);

  // TODO: currently the endpoint is hardcoded to only allow the following hash:
  // const hcHash = '0xf91cdba571422ba3da9e7b79cbc0d51e8208244c2679e4294eec4ab5807acf7f';
  // const url = DECODED_SPELL_ENDPOINT(hcHash);
  const url = DECODED_SPELL_ENDPOINT(hash);

  const diffs: DecodedDiffAPIResponse[] = await fetchJson(url);
  const validated = diffs.map(diff => validateDiff(diff));

  return validated;
}
