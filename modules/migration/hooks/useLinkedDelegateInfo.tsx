import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useDelegateContractExpirationDate } from 'modules/delegates/hooks/useDelegateContractExpirationDate';
import { addressConnections } from 'modules/migration/connections';

export function useLinkedDelegateInfo(): {
  newOwnerAddress?: string;
  newOwnerConnected: boolean;
  previousOwnerAddress?: string;
  previousOwnerConnected: boolean;
  newOwnerHasDelegateContract: boolean;
} {
  const { account: address } = useActiveWeb3React();

  const { data: delegateContractExpirationDate } = useDelegateContractExpirationDate();

  const oldToNewMap = addressConnections;
  const newToOldMap = Object.keys(addressConnections).reduce((acc, cur) => {
    return {
      ...acc,
      [addressConnections[cur]]: cur
    };
  }, {});

  const previousOwnerConnected = address ? !!oldToNewMap[address] : false;
  const newOwnerConnected = address ? !!newToOldMap[address] : false;

  const previousOwnerAddress = previousOwnerConnected ? address : address ? newToOldMap[address] : undefined;
  const newOwnerAddress = newOwnerConnected ? address : address ? oldToNewMap[address] : undefined;

  const newOwnerHasDelegateContract = !!delegateContractExpirationDate;

  return {
    newOwnerAddress,
    newOwnerConnected,
    previousOwnerAddress,
    previousOwnerConnected,
    newOwnerHasDelegateContract
  };
}
