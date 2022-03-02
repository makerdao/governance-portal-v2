import { Chief } from '.dethcrypto/eth-sdk-client/esm/types';

export async function getSlateAddresses(contract: Chief, slateHash: string, i = 0): Promise<string[]> {
  try {
    return [await contract.slates(slateHash, i)].concat(await getSlateAddresses(contract, slateHash, i + 1));
  } catch (_) {
    return [];
  }
}
