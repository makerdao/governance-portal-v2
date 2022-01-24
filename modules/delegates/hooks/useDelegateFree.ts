import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import abi from 'modules/contracts/ethers/voteDelegate.json';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';

type FreeResponse = {
  data?: any;
  loading: boolean;
  error: Error;
};

export const useDelegateFree = (voteDelegateAddress: string): FreeResponse => {
  const { chainId, library, account }: Web3ReactContextInterface<Web3Provider> = useActiveWeb3React();

  const { data, error } = useSWR(`${voteDelegateAddress}/vote-delegate-contract/free`, () => {
    const vdContract = getEthersContracts(voteDelegateAddress, abi, chainId, library, account || undefined);
    return vdContract.free;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
