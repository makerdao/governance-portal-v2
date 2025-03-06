import { useChainId } from 'wagmi';
import { SAFE_TRANSACTION_SERVICE_URL } from '../constants/wallets';
import { useQuery } from '@tanstack/react-query';

const getTransactionHash = async (url: URL): Promise<`0x${string}`> => {
  const res = await fetch(url);
  const data = await res.json();

  return data.transactionHash as `0x${string}`;
};

export const useWaitForSafeTxHash = ({
  chainId: paramChainId,
  safeTxHash,
  isSafeConnector
}: {
  chainId: number | undefined;
  safeTxHash: `0x${string}` | undefined;
  isSafeConnector: boolean;
}) => {
  const hookChainId = useChainId();
  const chainId = paramChainId || hookChainId;
  const baseUrl = SAFE_TRANSACTION_SERVICE_URL[chainId];
  let url: URL | undefined;
  if (baseUrl && safeTxHash) {
    const endpoint = `${baseUrl}/api/v1/multisig-transactions/${safeTxHash}/`;
    url = new URL(endpoint);
  }

  const { data: transactionHash } = useQuery({
    enabled: Boolean(url && safeTxHash && isSafeConnector),
    queryKey: ['safe-transaction-hash', safeTxHash, chainId, isSafeConnector],
    queryFn: () => getTransactionHash(url as URL),
    // Stop refetching if the transaction hash is found or the API has been queried for 5 minutes (150 * 2s = 5 minutes)
    refetchInterval: query => (query.state.data || query.state.dataUpdateCount >= 150 ? false : 2000),
    refetchIntervalInBackground: true
  });

  return transactionHash;
};
