import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { useDelegateContractExpirationDate } from 'modules/delegates/hooks/useDelegateContractExpirationDate';
import { getNewOwnerFromPrevious, getPreviousOwnerFromNew } from 'modules/migration/delegateAddressLinks';

export function useLinkedDelegateInfo(): {
  newOwnerAddress?: string;
  newOwnerConnected: boolean;
  previousOwnerAddress?: string;
  previousOwnerConnected: boolean;
  newOwnerHasDelegateContract: boolean;
} {
  const { account: address, network } = useWeb3();

  const { data: delegateContractExpirationDate } = useDelegateContractExpirationDate();

  // Means the old delegate in a mapping is connected
  const previousOwnerConnected = address ? !!getNewOwnerFromPrevious(address, network) : false;

  // Means the new delegate in a mapping is connected (we need to check also that the previous owner is not connected, since an address can be, after one year, both the previous and new delegates)
  /* For example: 
  { 
    '0x1': '0x2',
    '0x2': '0x3'
  }
  0x2 is both a new delegate for 0x1 and a previous delegate for 0x3
  */
  const newOwnerConnected = address
    ? !!getPreviousOwnerFromNew(address, network) && !previousOwnerConnected
    : false;

  const previousOwnerAddress = previousOwnerConnected
    ? address
    : address
    ? getPreviousOwnerFromNew(address, network)
    : undefined;

  const newOwnerAddress =
    newOwnerConnected && !previousOwnerConnected
      ? address
      : address
      ? getNewOwnerFromPrevious(address, network)
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
