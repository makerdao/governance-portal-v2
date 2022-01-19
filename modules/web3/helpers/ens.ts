import { ethers } from 'ethers';
import { config } from 'lib/config';
import { SupportedNetworks } from '../constants/networks';

export async function getENS(address: string): Promise<string | null> {
  const provider = ethers.getDefaultProvider(SupportedNetworks.MAINNET, {
    infura: config.INFURA_KEY,
    alchemy: config.ALCHEMY_KEY
  });

  try {
    const name = await provider.lookupAddress(address);
    return name;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function resolveENS(ensName: string): Promise<string | null> {
  const provider = ethers.getDefaultProvider(SupportedNetworks.MAINNET, {
    infura: config.INFURA_KEY,
    alchemy: config.ALCHEMY_KEY
  });

  try {
    const address = await provider.resolveName(ensName);
    return address;
  } catch (err) {
    console.log(err);
    return null;
  }
}
