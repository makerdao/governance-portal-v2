import useSWR from 'swr';
import getMaker from 'lib/maker';

type AllSlatesResponse = {
  data?: string[];
  loading: boolean;
  error?: Error;
};

export const useAllSlates = (): AllSlatesResponse => {
  const { data, error } = useSWR('/executive/all-slates', () =>
    getMaker().then(maker => maker.service('chief').getAllSlates())
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
