import { ContractName } from '../types/contracts';
import { useContracts } from './useContracts';

export const useApproveToken = (name: ContractName) => {
  const token = useContracts()[name];
  return token['approve(address,uint256)'];
};
