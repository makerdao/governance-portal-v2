import useDelegatedTo from 'modules/delegates/hooks/useDelegatedTo';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

export default function useDelegatedToExpired(): {
  isExpired: boolean;
  isAboutToExpire: boolean;
} {
  const { account: address, network } = useActiveWeb3React();

  const { data: delegatedToData } = useDelegatedTo(address, network);

  const isADelegateAboutToExpire = delegatedToData
    ? delegatedToData.delegatedTo.reduce((prev, next) => {
        return prev || next.isAboutToExpire;
      }, false)
    : false;

  const isADelegateExpired = delegatedToData
    ? delegatedToData.delegatedTo.reduce((prev, next) => {
        return prev || next.isExpired;
      }, false)
    : false;

  return {
    isExpired: isADelegateExpired,
    isAboutToExpire: isADelegateAboutToExpire
  };
}
