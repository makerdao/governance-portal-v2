import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { ethers } from 'ethers';
import { SupportedChainId } from '../constants/chainID';

export class PrivateKeyConnector extends AbstractConnector {
  private _address: string;
  private _privatekey: string;
  private provider: any;

  constructor(key: string, address: string) {
    super();

    this._address = address;

    const _url = 'http://localhost:8545';
    const provider = ethers.getDefaultProvider(_url);

    this.provider = provider;
    this._privatekey = key;
  }

  public async activate(): Promise<ConnectorUpdate> {
    return { provider: window.ethereum, account: this._address };
  }

  public async getProvider(): Promise<any> {
    return this.provider;
  }

  public async getChainId(): Promise<number | string> {
    return Promise.resolve(SupportedChainId.GOERLIFORK);
  }

  public async getAccount(): Promise<null | string> {
    return Promise.resolve(this._address);
  }

  public deactivate(): void {
    this._address = '';
    this._privatekey = '';
  }

  public async isAuthorized(): Promise<boolean> {
    return Promise.resolve(!!this._address);
  }
}
