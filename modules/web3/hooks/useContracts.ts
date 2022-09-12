import { useMemo } from 'react';
import { getContracts } from '../helpers/getContracts';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { SupportedChainId } from '../constants/chainID';
import { isSupportedChain } from 'modules/web3/helpers/chain';
import { EthSdk } from '../types/contracts';
import { providers } from 'ethers';

type Props = {
  chainId?: SupportedChainId;
  provider?: providers.Web3Provider;
  account?: string | null;
};

export const useContracts = (): EthSdk => {
  const { chainId, provider, account }: Props = useWeb3();

  const sdk = useMemo(
    () =>
      getContracts(isSupportedChain(chainId) ? chainId : SupportedChainId.MAINNET, provider, account, false),
    [chainId, provider, account]
  );

  return sdk;
};
