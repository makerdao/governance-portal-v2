import { ethers } from 'ethers';
import { SupportedChainId } from '../constants/chainID';
import { Eip1193Bridge } from '@ethersproject/experimental';
import logger from 'lib/logger';

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
    logger.debug('CustomizedBridge: sendAsync called', ...args);
    return this.send(...args);
  }
  async send(...args) {
    logger.debug('CustomizedBridge: send called', ...args);
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
      // If from is present on eth_call it errors, removing it makes the library set
      // from as the connected wallet which works fine
      if (params && params.length && params[0].from && method === 'eth_call') delete params[0].from;
      let result;
      // For sending a transaction if we call send it will error
      // as it wants gasLimit in sendTransaction but hexlify sets the property gas
      // to gasLimit which makes sensd transaction error.
      // This have taken the code from the super method for sendTransaction and altered
      // it slightly to make it work with the gas limit issues.
      if (params && params.length && params[0].from && method === 'eth_sendTransaction') {
        // Hexlify will not take gas, must be gasLimit, set this property to be gasLimit
        params[0].gasLimit = params[0].gas;
        delete params[0].gas;
        // If from is present on eth_sendTransaction it errors, removing it makes the library set
        // from as the connected wallet which works fine
        delete params[0].from;
        const req = ethers.providers.JsonRpcProvider.hexlifyTransaction(params[0]);
        // Hexlify sets the gasLimit property to be gas again and send transaction requires gasLimit
        req.gasLimit = req.gas;
        delete req.gas;
        // Send the transaction
        const tx = await this.signer.sendTransaction(req);
        result = tx.hash;
      } else if (params && params.length && method === 'personal_sign') {
        // 'eth_sign' is an outdated and unsafe method, replaced by 'personal_sign', but this
        // mock provider doesn't handle 'personal_sign' properly. Do not use 'eth_sign' in production.
        // first argument is 'address', second is 'message'
        return await super.send('eth_sign', [params[1], params[0]]);
      } else {
        // All other transactions the base class works for
        result = await super.send(method, params);
      }
      logger.debug('CustomizedBridge: result received', method, params, result);
      if (isCallbackForm) {
        callback(null, { result });
      } else {
        return result;
      }
    } catch (error) {
      logger.error('CustomizedBridge: error resolving result', method, params, error);
      if (isCallbackForm) {
        callback(error, null);
      } else {
        throw error;
      }
    }
  }
}
