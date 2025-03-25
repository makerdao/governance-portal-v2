/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { ArbitrumPollingAddressMap } from '../constants/addresses';
import { SignTypedDataData, SignTypedDataMutateAsync } from 'wagmi/query';

type BallotDataValues = {
  voter: string;
  pollIds: string[];
  optionIds: string[];
  nonce: number;
  expiry: number;
};

export function getTypedBallotData(message: BallotDataValues, network: SupportedNetworks) {
  // Chain ID must match the chain ID specified in the contract for the signature to be valid
  // e.g. https://github.com/makerdao-dux/polling-contract/blob/main/contracts/Polling.sol#L31
  const chainId = networkNameToChainId(network);
  return {
    types: {
      Vote: [
        {
          name: 'voter',
          type: 'address'
        },
        {
          name: 'nonce',
          type: 'uint256'
        },
        {
          name: 'expiry',
          type: 'uint256'
        },
        {
          name: 'pollIds',
          type: 'uint256[]'
        },
        {
          name: 'optionIds',
          type: 'uint256[]'
        }
      ]
    },
    primaryType: 'Vote' as const,
    domain: {
      name: 'MakerDAO Polling',
      version: 'Arbitrum.1',
      chainId,
      verifyingContract: ArbitrumPollingAddressMap[network]
    },
    message
  };
}

export async function signTypedBallotData(
  message: BallotDataValues,
  signTypedDataAsync: SignTypedDataMutateAsync,
  network: SupportedNetworks
): Promise<SignTypedDataData> {
  const { domain, types, message: typedMessage, primaryType } = getTypedBallotData(message, network);

  return signTypedDataAsync({ domain, types, message: typedMessage, primaryType });
}
