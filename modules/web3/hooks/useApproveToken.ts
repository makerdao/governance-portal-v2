/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ContractName } from '../types/contracts';
import { useContracts } from './useContracts';

export const useApproveToken = (name: ContractName) => {
  const token = useContracts()[name];
  return token['approve(address,uint256)'];
};
