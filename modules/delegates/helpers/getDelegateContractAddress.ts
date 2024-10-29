/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { EthSdk } from 'modules/web3/types/contracts';

export async function getDelegateContractAddress(
  contracts: EthSdk,
  address: string
): Promise<string | undefined> {
  const voteDelegateAdress = await contracts.voteDelegateFactory.delegates(address);
  const v1VoteDelegateAddress = await contracts.voteDelegateFactoryOld.delegates(address);
  return v1VoteDelegateAddress !== ZERO_ADDRESS
    ? v1VoteDelegateAddress
    : voteDelegateAdress !== ZERO_ADDRESS
    ? voteDelegateAdress
    : undefined;
}
