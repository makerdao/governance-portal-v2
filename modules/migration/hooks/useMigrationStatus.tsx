import { useDelegatedTo } from 'modules/delegates/hooks/useDelegatedTo';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useDelegateContractExpirationDate } from 'modules/delegates/hooks/useDelegateContractExpirationDate';
import { isAboutToExpireCheck, isExpiredCheck } from '../helpers/expirationChecks';
import { addressConnections } from 'modules/migration/connections';

export function useMigrationStatus(): {
  isDelegatedToExpiredContract: boolean;
  isDelegatedToExpiringContract: boolean;
  isDelegateContractExpired: boolean;
  isDelegateContractExpiring: boolean;
  newOwnerAddress?: string;
  newOwnerConnected: boolean;
  previousOwnerAddress?: string;
  previousOwnerConnected: boolean;
  newOwnerHasDelegateContract: boolean;
} {
  const { account: address, network } = useActiveWeb3React();

  const { data: delegatedToData } = useDelegatedTo(address, network);
  const { data: delegateContractExpirationDate } = useDelegateContractExpirationDate();

  const isDelegateContractExpiring = delegateContractExpirationDate
    ? isAboutToExpireCheck(delegateContractExpirationDate)
    : false;

  const isDelegateContractExpired = delegateContractExpirationDate
    ? isExpiredCheck(delegateContractExpirationDate)
    : false;

  const isDelegatedToExpiringContract = delegatedToData
    ? delegatedToData.delegatedTo.reduce((prev, next) => {
        return prev || next.isAboutToExpire;
      }, false)
    : false;

  const isDelegatedToExpiredContract = delegatedToData
    ? delegatedToData.delegatedTo.reduce((prev, next) => {
        return prev || next.isExpired;
      }, false)
    : false;

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
    isDelegatedToExpiredContract,
    isDelegatedToExpiringContract,
    isDelegateContractExpired,
    isDelegateContractExpiring: true,
    newOwnerAddress,
    newOwnerConnected,
    previousOwnerAddress,
    previousOwnerConnected,
    newOwnerHasDelegateContract
  };
}
