/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { MainnetSdk, ArbitrumOneSdk } from '@dethcrypto/eth-sdk-client';
import { providers, Signer } from 'ethers';

export type ContractName =
  | 'chief'
  | 'chiefOld'
  | 'dai'
  | 'end'
  | 'esm'
  | 'mkr'
  | 'iou'
  | 'iouOld'
  | 'pause'
  | 'pauseProxy'
  | 'polling'
  | 'pollingOld'
  | 'pot'
  | 'vat'
  | 'voteDelegateFactory'
  | 'voteProxyFactory'
  | 'vow';

export type EthSdk = MainnetSdk;

export type SignerOrProvider = Signer | providers.Provider;

export type SdkGenerators = {
  mainnet: (signerOrProvider: SignerOrProvider) => MainnetSdk;
  tenderly: (signerOrProvider: SignerOrProvider) => MainnetSdk;
};

export type ArbitrumSdkGenerators = {
  mainnet: (signerOrProvider: SignerOrProvider) => ArbitrumOneSdk;
  tenderly: (signerOrProvider: SignerOrProvider) => ArbitrumSepoliaSdk;
};
