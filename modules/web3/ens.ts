import ENS from 'ethereum-ens';
import getMaker from 'lib/maker';

export async function getENS(address: string): Promise<string> {
  const maker = await getMaker();

  const provider = maker.service('web3')._web3.currentProvider;

  const ens = new ENS(provider);

  const resolver = await ens.reverse(address);
  return await resolver.name();
}

export async function resolveENS(ensName: string): Promise<string> {
  const maker = await getMaker();

  const provider = maker.service('web3')._web3.currentProvider;

  const ens = new ENS(provider);

  return await ens.resolver(ensName).addr();
}
