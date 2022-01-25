import { useContext } from 'react';
import { AccountContext } from '../context/AccountContext';

export function useAccount() {
  const data = useContext(AccountContext);

  return data;
}
