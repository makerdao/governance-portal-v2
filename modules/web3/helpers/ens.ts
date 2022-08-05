import { SupportedNetworks } from '../constants/networks';
import { getDefaultProvider } from './getDefaultProvider';
import logger from 'lib/logger';

export async function resolveENS(ensName: string): Promise<string | null> {
  const provider = getDefaultProvider(SupportedNetworks.MAINNET);

  try {
    const address = await provider.resolveName(ensName);
    return address;
  } catch (err) {
    logger.error(`resolveENS: ${ensName}. Unable to resolve.`, err);
    return null;
  }
}
