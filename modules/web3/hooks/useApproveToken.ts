import { useContracts } from './useContracts';

export const useApproveToken = (name: string) => {
  const token = useContracts()[name];
  return token['approve(address,uint256)'];
};
