/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { BigNumber, ethers } from 'ethers';
import useSWR from 'swr';
import { ContractName } from '../types/contracts';
import { useContracts } from './useContracts';

type TokenAllowanceResponse = {
  data?: boolean;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// Checks if the user allowed the spending of a token and contract address
export const useTokenAllowance = (
  name: ContractName,
  amount: BigNumber,
  userAddress?: string,
  contractAddress?: string
): TokenAllowanceResponse => {
  const token: ethers.Contract = useContracts()[name];

  const { data, error, mutate } = useSWR(
    userAddress && contractAddress ? ['token-balance', token.address, userAddress, contractAddress] : null,
    async (_, tokenAddress, userAddress, contractAddress) => {
      const ethersBn: BigNumber = await token.allowance(userAddress, contractAddress);
      return ethersBn.gt(amount);
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
