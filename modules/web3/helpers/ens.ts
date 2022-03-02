import { SupportedNetworks } from '../constants/networks';
import { getDefaultProvider } from './getDefaultProvider';

export async function getENS(address: string): Promise<string | null> {
  const provider = getDefaultProvider(SupportedNetworks.MAINNET);

  try {
    const name = await provider.lookupAddress(address);
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
