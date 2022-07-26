import { Web3Provider } from '@ethersproject/providers';
import { SupportedChainId } from '../constants/chainID';

type BallotDataValues = {
  voter: string;
  pollIds: string[];
  optionIds: string[];
  nonce: number;
  expiry: number;
};

type SignatureObject = {
  v: number;
  s: string;
  r: string;
};

export async function signTypedBallotData(
  message: BallotDataValues,
  provider: Web3Provider,
  chainId: SupportedChainId
): Promise<SignatureObject | null> {
  const typedData = JSON.stringify({
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
    primaryType: 'Vote',
    domain: {
      name: 'MakerDAO Polling',
      version: 'Arbitrum.1',
      chainId,
      //TODO: get verifying contract address from constant variable
      verifyingContract: '0xc5C7bC9f0F54f2F6c441A774Ef93aCf06cE3DfA3'
    },
    message
  });

  let rawSig;
  try {
    rawSig = await provider.send('eth_signTypedData_v4', [message.voter, typedData]);
  } catch (error) {
    return null;
  }
  const r = rawSig.slice(0, 66);
  const s = '0x' + rawSig.slice(66, 130);
  const v = Number('0x' + rawSig.slice(130, 132));
  return { v, r, s };
}
