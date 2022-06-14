import { Web3Provider } from '@ethersproject/providers';
import { SupportedChainId } from '../constants/chainID';

type BallotDataValues = {
  voter: string;
  pollIds: string[];
  options: string[];
};

export async function signTypedBallotData(
  address: string,
  values: BallotDataValues,
  provider: Web3Provider,
  chainId: SupportedChainId
): Promise<string> {
  const signer = provider.getSigner(address);
  const domain = {
    name: 'MakerDAO Governance Portal',
    version: '1',
    chainId
  };
  const types = {
    Ballot: [
      { name: 'voter', type: 'address' },
      { name: 'pollIds', type: 'uint256[]' },
      { name: 'options', type: 'uint256[]' }
    ]
  };

  return signer._signTypedData(domain, types, values);
}
