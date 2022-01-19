import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import abi from 'modules/contracts/ethers/voteProxy.json';

type VoteProxyAddresses = {
  hotAddress: string | undefined;
  coldAddress: string | undefined;
  voteProxyAddress: string | undefined;
  hasProxy: boolean;
};

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error: Error;
};

export const useVoteProxyAddress = (addressToCheck?: string): VoteProxyAddressResponse => {
  let account;

  const { voteProxyFactory } = useContracts();

  if (addressToCheck) {
    account = addressToCheck;
  } else {
    const activeWeb3 = useActiveWeb3React();
    account = activeWeb3.account;
  }

  const { data, error } = useSWR(`${account}/vote-proxy-address`, async () => {
    let hotAddress: string | undefined,
      coldAddress: string | undefined,
      voteProxyAddress: string | undefined,
      hasProxy = false;

    const [proxyAddressCold, proxyAddressHot] = await Promise.all([
      voteProxyFactory.coldMap(account),
      voteProxyFactory.hotMap(account)
    ]);

    if (proxyAddressCold !== ZERO_ADDRESS) {
      voteProxyAddress = proxyAddressCold;
      coldAddress = account;
    } else if (proxyAddressHot !== ZERO_ADDRESS) {
      voteProxyAddress = proxyAddressHot;
      hotAddress = account;
    }

    if (voteProxyAddress) {
      const vpContract = getEthersContracts(voteProxyAddress, abi);
      hotAddress = hotAddress ?? (await vpContract.hot());
      coldAddress = coldAddress ?? (await vpContract.cold());
      hasProxy = true;
    }

    return { hotAddress, coldAddress, voteProxyAddress, hasProxy };
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
