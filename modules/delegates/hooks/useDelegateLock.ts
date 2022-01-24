import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import abi from 'modules/contracts/ethers/voteDelegate.json';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';

type LockResponse = {
  data?: any;
  loading: boolean;
  error: Error;
};

export const useDelegateLock = (voteDelegateAddress: string): LockResponse => {
  const { chainId, library, account }: Web3ReactContextInterface<Web3Provider> = useActiveWeb3React();

  const { data, error } = useSWR(`${voteDelegateAddress}/vote-delegate-contract/lock`, () => {
    const vdContract = getEthersContracts(voteDelegateAddress, abi, chainId, library, account);
    return vdContract.lock;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
