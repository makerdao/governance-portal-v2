import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { Eip1193Bridge } from '@ethersproject/experimental';
import { SupportedNetworks } from 'modules/web3/constants/networks';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// export {};

//Good ol 0x16fb
const TEST_PRIVATE_KEY = '0x474beb999fed1b3af2ea048f963833c686a0fba05f5724cb6417cf3b8ee9697e';
// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address;

class CustomizedBridge extends Eip1193Bridge {
  chainId = SupportedChainId.GOERLIFORK;
  chainIdHex = '0x7a69';
  // chainId = SupportedChainId.GOERLI
  // chainIdHex = '0x5'

  async sendAsync(...args) {
    console.debug('sendAsync called', ...args);
    return this.send(...args);
  }
  async send(...args) {
    console.debug('send called', ...args);
    const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function';
    let callback;
    let method;
    let params;
    if (isCallbackForm) {
      callback = args[1];
      method = args[0].method;
      params = args[0].params;
    } else {
      method = args[0];
      params = args[1];
    }
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      if (isCallbackForm) {
        callback({ result: [TEST_ADDRESS_NEVER_USE] });
      } else {
        return Promise.resolve([TEST_ADDRESS_NEVER_USE]);
      }
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        callback(null, { result: this.chainIdHex });
      } else {
        return Promise.resolve(this.chainIdHex);
      }
    }
    try {
      const result = await super.send(method, params);
      console.debug('result received', method, params, result);
      if (isCallbackForm) {
        callback(null, { result });
      } else {
        return result;
      }
    } catch (error) {
      if (isCallbackForm) {
        callback(error, null);
      } else {
        throw error;
      }
    }
  }
}
// sets up the injected provider to be a mock ethereum provider with the given mnemonic/index
// eslint-disable-next-line no-undef
Cypress.Commands.overwrite('visit', (original: any, url: string, options: any) => {
  return original(url.startsWith('/') && url.length > 2 && !url.startsWith('/#') ? `/#${url}` : url, {
    ...options,
    onBeforeLoad(win) {
      options && options.onBeforeLoad && options.onBeforeLoad(win);
      win.localStorage.clear();
      const rpcUrl = 'http://localhost:8545';
      const provider = new JsonRpcProvider(rpcUrl, SupportedChainId.GOERLIFORK);
      const signer = new Wallet(TEST_PRIVATE_KEY, provider);

      // Only required to make Maker class happy until we remove it...
      // See syncMakerAccount
      win.ethereum = new CustomizedBridge(signer, provider);
    }
  });
});
