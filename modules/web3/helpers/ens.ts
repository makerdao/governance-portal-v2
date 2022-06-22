import { SupportedNetworks } from '../constants/networks';
import { getDefaultProvider } from './getDefaultProvider';
import { Web3Provider } from '@ethersproject/providers';

export async function getENS({
  address,
  library
}: {
  address: string;
  library: Web3Provider;
}): Promise<string | null> {
  try {
    const name = await library.lookupAddress(address);
    return name;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function resolveENS(ensName: string): Promise<string | null> {
  const provider = getDefaultProvider(SupportedNetworks.MAINNET);

  try {
    const address = await provider.resolveName(ensName);
    return address;
  } catch (err) {
    console.log(err);
    return null;
  }
}
