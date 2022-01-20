import { ContractName } from '../types/contracts';
import { useContracts } from './useContracts';

export const useApproveUnlimitedToken = (name: ContractName) => {
  const token = useContracts()[name];
  return token['approve(address)'];
};
