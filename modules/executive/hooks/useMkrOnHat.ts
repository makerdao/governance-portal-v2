import getMaker from 'lib/maker';
import useSWR from 'swr';
import { CurrencyObject } from 'types/currency';

type MkrOnHatResponse = {
  data?: CurrencyObject;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

export const useMkrOnHat = (): MkrOnHatResponse => {
  const { data, error, mutate } = useSWR<CurrencyObject>(
    '/executive/mkr-on-hat',
    async () => {
      const maker = await getMaker();
      const hat = await maker.service('chief').getHat();
      return maker.service('chief').getApprovalCount(hat);
    },
    // refresh every 5 mins
    { refreshInterval: 300000 }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
