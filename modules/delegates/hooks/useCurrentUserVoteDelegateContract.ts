import { useMemo } from 'react';
import { Contract } from 'ethers';
import abi from 'modules/contracts/ethers/voteDelegate.json';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useVoteDelegateAddress } from './useVoteDelegateAddress';

type VoteDelegateResponse = {
  data?: Contract | undefined;
  loading: boolean;
  error?: Error;
};

export const useCurrentUserVoteDelegateContract = (): VoteDelegateResponse => {
  const { chainId, library, account } = useActiveWeb3React();

  const { data: contractAddress } = useVoteDelegateAddress(account);

  try {
    const contract = useMemo(
      () =>
        contractAddress ? getEthersContracts(contractAddress, abi, chainId, library, account) : undefined,
      [contractAddress]
    );

    return {
      data: contract,
      loading: false
    };
  } catch (e) {
    return {
      data: undefined,
      loading: false,
      error: e
    };
  }
};
