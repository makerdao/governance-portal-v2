import { useDelegatedTo } from 'modules/delegates/hooks/useDelegatedTo';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useDelegateContractExpirationDate } from 'modules/delegates/hooks/useDelegateContractExpirationDate';
import { isAboutToExpireCheck, isExpiredCheck } from '../helpers/expirationChecks';

export function useMigrationStatus(): {
  isDelegatedToExpiredContract: boolean;
  isDelegatedToExpiringContract: boolean;
  isDelegateContractExpired: boolean;
  isDelegateContractExpiring: boolean;
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

  return {
    isDelegatedToExpiredContract,
    isDelegatedToExpiringContract,
    isDelegateContractExpired,
    isDelegateContractExpiring
  };
}
