import { useMemo } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { EthSdk, getContracts } from '../helpers/getContracts';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { SupportedChainId } from '../constants/chainID';
import { isSupportedChain } from 'modules/web3/helpers/chain';

type Props = {
  chainId?: SupportedChainId;
  provider?: Web3Provider;
  account?: string | null;
};

export const useContracts = (apiKey?: string): EthSdk => {
  const { chainId, provider, account }: Props = useWeb3();

  const sdk = useMemo(
    () =>
      getContracts(
        isSupportedChain(chainId) ? chainId : SupportedChainId.MAINNET,
        provider,
        account,
        false,
        apiKey
      ),
    [chainId, provider, account]
  );

  return sdk;
};
