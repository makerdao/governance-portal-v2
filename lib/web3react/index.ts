// TODO move everything under web3react/ to its own module

import ProviderSubprovider from 'web3-provider-engine/dist/es5/subproviders/provider';
export * from './connectors';
export * from './getLibrary';

// TODO: remove this
export const Web3ReactPlugin = maker => {
  maker.service('accounts', true).addAccountType('web3-react', ({ library, address }) => {
    const { provider, connector } = library;
    const subprovider = new ProviderSubprovider(provider);
    return { subprovider, address, connector };
  });
};
