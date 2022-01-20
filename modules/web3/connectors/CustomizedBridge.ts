import { SupportedChainId } from '../constants/chainID';
import { Eip1193Bridge } from '@ethersproject/experimental';

export class CustomizedBridge extends Eip1193Bridge {
  chainId = SupportedChainId.GOERLIFORK;
  chainIdHex = '0x7a69';
  address: string;
  // chainId = SupportedChainId.GOERLI
  // chainIdHex = '0x5'

  setAddress(add: string) {
    this.address = add;
  }

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
        callback({ result: [this.address] });
      } else {
        return Promise.resolve([this.address]);
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
