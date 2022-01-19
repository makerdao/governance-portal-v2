import { Web3Provider } from '@ethersproject/providers';
import { EthSdk, getContracts } from '../helpers/getContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { SupportedChainId } from '../constants/chainID';

type Props = {
  chainId?: SupportedChainId;
  library?: Web3Provider;
  account?: string | null;
};

export const useContracts = (): EthSdk => {
  const { chainId, library, account }: Props = useActiveWeb3React();

  return getContracts(chainId ?? SupportedChainId.MAINNET, library, account);
};
