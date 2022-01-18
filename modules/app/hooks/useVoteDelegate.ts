import { Contract } from 'ethers';
import { useEthersContracts } from 'modules/web3/hooks/useEthersContracts';
import abi from '../../../contracts/abis/voteDelegate.json';
import { useVoteDelegateAddress } from './useVoteDelegateAddress';

export const useVoteDelegate = (): Contract | null => {
  const { data: address } = useVoteDelegateAddress();
  if (address) {
    return useEthersContracts(address, abi);
  }

  return null;
};
