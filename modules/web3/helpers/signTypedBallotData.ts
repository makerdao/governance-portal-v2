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
): Promise<SignatureObject> {

  const typedData = JSON.stringify({
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      Vote: [
        {
          name: 'voter',
          type: 'address',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'expiry',
          type: 'uint256',
        },
        {
          name: 'pollIds',
          type: 'uint256[]',
        },
        {
          name: 'optionIds',
          type: 'uint256[]',
        }
      ],
    },
    primaryType: 'Vote',
    domain: {
      name: 'MakerDAO Polling',
      version: 'Arbitrum.1',
      chainId,
      //TODO: get verifying contract address from constant variable
      verifyingContract: '0x067Fc8812aEBa3f813D4DA49C7e2898E731d67d9',
    },
    message
  });

  const rawSig = await provider.send(
    'eth_signTypedData_v4',
    [message.voter, typedData]
  );

  const r = rawSig.slice(0, 66);
  const s = '0x' + rawSig.slice(66, 130);
  const v = Number('0x' + rawSig.slice(130, 132));
  console.log({v, r, s});
  return { v, r, s };
}
