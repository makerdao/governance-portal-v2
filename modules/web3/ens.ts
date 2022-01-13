import { ethers } from 'ethers';
import { config } from 'lib/config';
import { SupportedNetworks } from 'lib/constants';

export async function getENS(address: string): Promise<string | null> {
  const provider = ethers.getDefaultProvider(SupportedNetworks.MAINNET, {
    infura: config.INFURA_KEY,
    alchemy: config.ALCHEMY_KEY
  });

  const name = await provider.lookupAddress(address);
  return name;
}

export async function resolveENS(ensName: string): Promise<string | null> {
  const provider = ethers.getDefaultProvider(SupportedNetworks.MAINNET, {
    infura: config.INFURA_KEY,
    alchemy: config.ALCHEMY_KEY
  });

  const address = await provider.resolveName(ensName);
  return address;
}
