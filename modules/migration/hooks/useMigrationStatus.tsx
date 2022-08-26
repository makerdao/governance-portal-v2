import { useDelegatedTo } from 'modules/delegates/hooks/useDelegatedTo';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { useDelegateContractExpirationDate } from 'modules/delegates/hooks/useDelegateContractExpirationDate';
import { isAboutToExpireCheck, isExpiredCheck } from '../helpers/expirationChecks';
import BigNumber from 'bignumber.js';

export function useMigrationStatus(): {
  isDelegatedToExpiredContract: boolean;
  isDelegatedToExpiringContract: boolean;
  isDelegateContractExpired: boolean;
  isDelegateContractExpiring: boolean;
} {
  const { account: address, network } = useWeb3();

  const { data: delegatedToData } = useDelegatedTo(address, network);
  const { data: delegateContractExpirationDate } = useDelegateContractExpirationDate();

  const isDelegateContractExpiring = delegateContractExpirationDate
    ? isAboutToExpireCheck(delegateContractExpirationDate)
    : false;

  // check if is delegating to an expired contract, independently of its renewal status
  const isDelegateContractExpired = delegateContractExpirationDate
    ? isExpiredCheck(delegateContractExpirationDate)
    : false;

  // Checks if its delegating to an expiring contract that is already renewed.
  const isDelegatedToExpiringContract = delegatedToData
    ? delegatedToData.delegatedTo.reduce((acc, cur) => {
        return acc || (cur.isAboutToExpire && cur.isRenewed && new BigNumber(cur.lockAmount).gt(0));
      }, false)
    : false;

  const isDelegatedToExpiredContract = delegatedToData
    ? delegatedToData.delegatedTo.reduce((acc, cur) => {
        return acc || (cur.isExpired && new BigNumber(cur.lockAmount).gt(0));
      }, false)
    : false;

  return {
    isDelegatedToExpiredContract,
    isDelegatedToExpiringContract,
    isDelegateContractExpired,
    isDelegateContractExpiring
  };
}
