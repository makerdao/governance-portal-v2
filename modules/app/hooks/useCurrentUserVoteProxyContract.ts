import { useMemo } from 'react';
import { Contract } from 'ethers';
import abi from 'modules/contracts/ethers/voteDelegate.json';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useVoteProxyAddress } from './useVoteProxyAddress';

type VoteDelegateResponse = {
  data?: Contract | undefined;
  loading: boolean;
  error?: Error;
};

export const useCurrentUserVoteProxyContract = (): VoteDelegateResponse => {
  const { chainId, library, account } = useActiveWeb3React();

  const { data } = useVoteProxyAddress(account);

  try {
    const contract = useMemo(
      () =>
        data?.voteProxyAddress
          ? getEthersContracts(data?.voteProxyAddress, abi, chainId, library, account)
          : undefined,
      [data?.voteProxyAddress]
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
