import { Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import useSWR from 'swr';
import abi from '../../../contracts/abis/voteDelegate.json';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useVoteDelegateAddress } from './useVoteDelegateAddress';

type VoteDelegateResponse = {
  data?: Contract | undefined | null;
  loading: boolean;
  error: Error;
};

export const useVoteDelegate = (): VoteDelegateResponse => {
  const { chainId, library, account }: Web3ReactContextInterface<Web3Provider> = useActiveWeb3React();

  const { data: contractAddress } = useVoteDelegateAddress();

  const { data, error } = useSWR(contractAddress ? `${contractAddress}/vote-delegate-contract` : null, () => {
    return contractAddress ? getEthersContracts(contractAddress, abi, chainId, library, account) : null;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
