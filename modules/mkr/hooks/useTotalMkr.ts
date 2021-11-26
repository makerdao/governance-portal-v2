// Returns the total supply of MKR

import getMaker, { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { CurrencyObject } from 'types/currency';

export const useTotalMKR = (): {
  data: CurrencyObject;
} => {
  const { data } = useSWR(
    '/total-mkr-supply',
    async () => {
      const maker = await getMaker(getNetwork());

      const total = await maker.service('token').getToken('MKR').totalSupply();

      return total;
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false
    }
  );

  return {
    data
  };
};
