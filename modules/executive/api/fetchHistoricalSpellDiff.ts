import { ethers } from 'ethers';
import { fetchJson } from 'lib/fetchJson';
import { validateDiff } from '../helpers/spellDiffParsers';
import { DecodedDiffAPIResponse, SpellDiff } from '../types';

export async function fetchHistoricalSpellDiff(proposalAddress: string): Promise<SpellDiff[]> {
  if (!proposalAddress) return [];
  // TODO: this sig is for 'cast()' which is what we're looking for.
  // It could also also be retrieved by using ethers Interface.encodeFunctionData(), but we always know it, so...
  const castSig = '0x96d373e5';

  // Need to find the tx of the cast spell
  const provider = new ethers.providers.EtherscanProvider();
  const history = await provider.getHistory(proposalAddress);
  const castTx = history.filter(h => h.data === castSig);

  if (castTx.length > 1) {
    // TODO: Need to loop & fetch the txns from the provider to find the successful one
    console.warn('multiple matching txs', castTx);
  }
  const [{ hash }] = castTx;
  console.log('transaction hash for decoding', hash);

  // TODO: currently the endpoint is hardcoded to only allow the following hash:
  const hcHash = '0xf91cdba571422ba3da9e7b79cbc0d51e8208244c2679e4294eec4ab5807acf7f';
  const url = `http://18.157.179.179/api/v1/transactions/${hcHash}/diffs/decoded`;

  const diffs: DecodedDiffAPIResponse[] = await fetchJson(url);
  const validated = diffs.map(diff => validateDiff(diff));

  return validated;
}
