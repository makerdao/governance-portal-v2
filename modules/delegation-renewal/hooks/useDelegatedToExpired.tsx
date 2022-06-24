import { isBefore, sub } from 'date-fns';
import useDelegatedTo from 'modules/delegates/hooks/useDelegatedTo';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

export default function useDelegatedToExpired(): boolean {
  const { account: address, network } = useActiveWeb3React();

  const { data: delegatedToData } = useDelegatedTo(address, network);

  const isADelegateAboutToExpire = delegatedToData
    ? delegatedToData.delegatedTo.reduce((prev, next) => {
        // check if it has less than one week to expire or is expired
        const isExpiredOrAboutToExpire = isBefore(
          new Date(next.expirationDate),
          sub(new Date(), { days: 7 })
        );

        return prev || isExpiredOrAboutToExpire;
      }, false)
    : false;

  return isADelegateAboutToExpire;
}
