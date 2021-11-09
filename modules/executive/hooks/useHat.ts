import useSWR from 'swr';
import getMaker from 'lib/maker';

type HatResponse = {
  data?: string;
  loading: boolean;
  error?: Error;
};

export const useHat = (): HatResponse => {
  const { data, error } = useSWR<string>('/executive/hat', () =>
    getMaker().then(maker => maker.service('chief').getHat())
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
