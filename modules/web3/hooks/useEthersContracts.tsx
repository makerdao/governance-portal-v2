import { Web3Provider } from '@ethersproject/providers';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { SupportedChainId } from 'modules/web3/web3.constants';
import { Contract } from 'ethers';
import { getEthersContracts } from '../helpers/getEthersContracts';

type Props = {
  chainId?: SupportedChainId;
  library?: Web3Provider;
  account?: string | null;
};

export const useEthersContracts = (address: string, abi: any): Contract => {
  const { chainId, library, account }: Props = useActiveWeb3React();
  const signer = account && library ? library.getSigner(account) : null;

  return getEthersContracts(address, abi, chainId, signer);
};
