import { ethers } from 'ethers';
import { useCurrentUserVoteDelegateContract } from 'modules/delegates/hooks/useCurrentUserVoteDelegateContract';
import { useVoteDelegateAddress } from 'modules/delegates/hooks/useVoteDelegateAddress';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useCurrentUserVoteProxyContract } from './useCurrentUserVoteProxyContract';
import { useVoteProxyAddress } from './useVoteProxyAddress';

type UseAccountResponse = {
  account?: string;
  voteDelegateContractAddress?: string;
  voteProxyContractAddress?: string;
  oldVoteProxyContractAddress?: string;
  oldVoteProxyContract?: ethers.Contract;
  voteProxyHotAddress?: string;
  voteProxyColdAddress?: string;
  voteProxyContract?: ethers.Contract;
  voteDelegateContract?: ethers.Contract;
  mutate: () => void;
};

export function useAccount(): UseAccountResponse {
  const { account } = useActiveWeb3React();

  if (!account) {
    return {
      account,
      mutate: () => null
    };
  }

  // Address of the vote delegate contract
  const { data: voteDelegateContractAddress, mutate: muteateVoteDelegate } = useVoteDelegateAddress(account);
  const { data: voteDelegateContract } = useCurrentUserVoteDelegateContract();
  const { data: voteProxyResponse } = useVoteProxyAddress(account);
  const { data: voteProxyContract } = useCurrentUserVoteProxyContract();

  return {
    account,
    voteDelegateContractAddress,
    voteProxyContractAddress: voteProxyResponse?.voteProxyAddress,
    oldVoteProxyContractAddress: 'TODO',
    // TODO: add oldVoteProxyContract and check withdrawOldChief
    voteProxyHotAddress: voteProxyResponse?.hotAddress,
    voteProxyColdAddress: voteProxyResponse?.coldAddress,
    voteProxyContract,
    voteDelegateContract,
    mutate: () => {
      muteateVoteDelegate();
    }
  };
}
