import Maker from '@makerdao/dai';
import McdPlugin, { DAI } from '@makerdao/dai-plugin-mcd';
import LedgerPlugin from '@makerdao/dai-plugin-ledger-web';
import TrezorPlugin from '@makerdao/dai-plugin-trezor-web';
import GovernancePlugin, { MKR } from '@makerdao/dai-plugin-governance';
import { config } from '../config';
import { MakerClass } from '@makerdao/dai/dist/Maker';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { Web3ReactPlugin } from './web3react';
import { getRPCFromChainID } from 'modules/web3/helpers/getRPC';

export const ETH = Maker.currencies.ETH;
export const USD = Maker.currencies.USD;
export { MKR };

type MakerSingletons = {
  [SupportedNetworks.MAINNET]: null | Promise<MakerClass>;
  [SupportedNetworks.GOERLI]: null | Promise<MakerClass>;
  [SupportedNetworks.TESTNET]: null | Promise<MakerClass>;
  [SupportedNetworks.GOERLIFORK]: null | Promise<MakerClass>;
};

const makerSingletons: MakerSingletons = {
  [SupportedNetworks.MAINNET]: null,
  [SupportedNetworks.GOERLI]: null,
  [SupportedNetworks.TESTNET]: null,
  [SupportedNetworks.GOERLIFORK]: null
};

async function getMaker(network?: SupportedNetworks): Promise<MakerClass> {
  // Chose the network we are referring to or default to the one set by the system
  const currentNetwork = network ? network : 'mainnet';
  if (!makerSingletons[currentNetwork]) {
    const instance = Maker.create('http', {
      plugins: [
        [McdPlugin, { prefetch: false }],
        [GovernancePlugin, { network: currentNetwork, staging: !config.USE_PROD_SPOCK }],
        Web3ReactPlugin,
        LedgerPlugin,
        TrezorPlugin
      ],
      provider: {
        url: getRPCFromChainID(networkNameToChainId(currentNetwork)),
        type: 'HTTP'
      },
      web3: {
        pollingInterval: null
      },
      log: false,
      multicall: true
    });
    makerSingletons[currentNetwork] = instance;
  }

  return makerSingletons[currentNetwork] as Promise<MakerClass>;
}

function isSupportedNetwork(_network: string): _network is SupportedNetworks {
  return Object.values(SupportedNetworks).some(network => network.toLowerCase() === _network);
}

async function personalSign(message: string): Promise<any> {
  const maker = await getMaker();
  const provider = maker.service('web3')._web3.currentProvider;
  const from = maker.currentAddress();
  return new Promise((resolve, reject) => {
    provider.sendAsync(
      {
        method: 'personal_sign',
        params: [message, from],
        from
      },
      (err, res) => {
        if (err) reject(err);
        resolve(res.result);
      }
    );
  });
}

export default getMaker;
export { DAI, isSupportedNetwork, personalSign };
