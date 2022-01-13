import { getContracts } from '../helpers/getContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

export const useContracts = (): any => {
  const { chainId, library } = useActiveWeb3React();

  return getContracts(chainId, library);
};
