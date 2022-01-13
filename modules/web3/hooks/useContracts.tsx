import { getContracts } from '../helpers/getContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { SupportedChainId } from 'modules/web3/web3.constants';

export const useContracts = (): any => {
  const { chainId, library } = useActiveWeb3React();

  return getContracts(chainId ?? SupportedChainId.MAINNET, library);
};
