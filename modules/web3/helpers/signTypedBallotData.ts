import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { ArbitrumPollingAddressMap } from '../constants/addresses';

type BallotDataValues = {
  voter: string;
  pollIds: string[];
  optionIds: string[];
  nonce: number;
  expiry: number;
};

export function getTypedBallotData(message: BallotDataValues, network: SupportedNetworks) {
  const chainId = networkNameToChainId(network);
  return {
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'version',
          type: 'string'
        },
        {
          name: 'chainId',
          type: 'uint256'
        },
        {
          name: 'verifyingContract',
          type: 'address'
        }
      ],
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
  provider: JsonRpcProvider | Web3Provider,
  network: SupportedNetworks
): Promise<string | null> {
  const typedData = JSON.stringify(getTypedBallotData(message, network));

  try {
    return provider.send('eth_signTypedData_v4', [message.voter, typedData]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}
