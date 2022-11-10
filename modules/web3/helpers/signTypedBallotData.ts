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
  // Chain ID must match the chain ID specified in the contract for the signature to be valid
  // e.g. https://github.com/makerdao-dux/polling-contract/blob/main/contracts/Polling.sol#L31
  const networkForSignature = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;
  const chainId = networkNameToChainId(networkForSignature);
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
  provider: JsonRpcProvider | Web3Provider,
  network: SupportedNetworks
): Promise<string> {
  const signer = provider.getSigner();
  const typedData = getTypedBallotData(message, network);

  return signer._signTypedData(typedData.domain, typedData.types, typedData.message);
}
