import { useContracts } from './useContracts';

export const useApproveUnlimitedToken = (name: string) => {
  const token = useContracts()[name];
  return token['approve(address)'];
};
