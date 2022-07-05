import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useDelegateContractExpirationDate } from 'modules/delegates/hooks/useDelegateContractExpirationDate';
import { getNewOwnerFromPrevious, getPreviousOwnerFromNew } from 'modules/migration/delegateAddressLinks';

export function useLinkedDelegateInfo(): {
  newOwnerAddress?: string;
  newOwnerConnected: boolean;
  previousOwnerAddress?: string;
  previousOwnerConnected: boolean;
  newOwnerHasDelegateContract: boolean;
} {
  const { account: address } = useActiveWeb3React();

  const { data: delegateContractExpirationDate } = useDelegateContractExpirationDate();

  const previousOwnerConnected = address ? !!getNewOwnerFromPrevious(address) : false;
  const newOwnerConnected = address ? !!getPreviousOwnerFromNew(address) : false;

  const previousOwnerAddress = previousOwnerConnected
    ? address
    : address
    ? getPreviousOwnerFromNew(address)
    : undefined;
  const newOwnerAddress = newOwnerConnected
    ? address
    : address
    ? getNewOwnerFromPrevious(address)
    : undefined;

  const newOwnerHasDelegateContract = !!delegateContractExpirationDate;

  return {
    newOwnerAddress,
    newOwnerConnected,
    previousOwnerAddress,
    previousOwnerConnected,
    newOwnerHasDelegateContract
  };
}
