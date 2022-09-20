import { useContracts } from 'modules/web3/hooks/useContracts';
import { ContractName } from 'modules/web3/types/contracts';

export const useContractAddress = (contractName: ContractName): string => {
  const contracts = useContracts();

  return contracts[contractName]?.address;
};
