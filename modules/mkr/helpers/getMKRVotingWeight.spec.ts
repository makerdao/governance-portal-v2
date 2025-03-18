/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getMKRVotingWeight } from './getMKRVotingWeight';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { Mock, vi } from 'vitest';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { mkrAbi, mkrAddress } from 'modules/contracts/generated';
import { SupportedChainId } from 'modules/web3/constants/chainID';

vi.mock('modules/web3/helpers/getPublicClient');
vi.mock('modules/delegates/helpers/getDelegateContractAddress');
vi.mock('modules/app/helpers/getVoteProxyAddresses');

describe('getMKRVotingWeight', () => {
  const readContractCallParameters = {
    abi: mkrAbi,
    address: mkrAddress[SupportedChainId.TENDERLY]
  };

  const fakeDelegateOwnerAddress = '0x9999567890123456789012345678901234567890';
  const fakeDelegateAddress = '0x1234567890123456789012345678901234567890';
  const balanceMock = vi.fn().mockImplementation(({ args }) => {
    if (args[0] === fakeDelegateAddress) {
      return Promise.resolve(100n);
    }
    return Promise.resolve(0n);
  });
  beforeAll(() => {
    (getPublicClient as Mock).mockReturnValue({
      readContract: balanceMock
    });

    (getDelegateContractAddress as Mock).mockReturnValue(undefined);

    (getVoteProxyAddresses as Mock).mockReturnValue({});
  });

  it('should return 0 if no MKR is locked', async () => {
    const result = await getMKRVotingWeight(fakeDelegateOwnerAddress, SupportedNetworks.TENDERLY, false);
    expect(balanceMock).toHaveBeenLastCalledWith({
      ...readContractCallParameters,
      args: [fakeDelegateOwnerAddress]
    });
    expect(result).toEqual({
      walletBalanceHot: 0n,
      chiefBalanceHot: 0n,
      chiefTotal: 0n,
      total: 0n
    });
  });

  // it('should include the delegate contract weight by default', async () => {
  //   (getDelegateContractAddress as Mock).mockReturnValue(fakeDelegateAddress);
  //   const result = await getMKRVotingWeight(fakeDelegateOwnerAddress, SupportedNetworks.TENDERLY, false);
  //   expect(balanceMock).toHaveBeenLastCalledWith({ fakeDelegateAddress });
  //   expect(result).toEqual({
  //     walletBalanceHot: 100n,
  //     chiefBalanceHot: 0n,
  //     chiefTotal: 0n,
  //     total: 100n
  //   });
  // });

  // it('should exclude the delegate contract weight if param is true', async () => {
  //   (getDelegateContractAddress as Mock).mockReturnValue(fakeDelegateAddress);
  //   const result = await getMKRVotingWeight(fakeDelegateOwnerAddress, SupportedNetworks.TENDERLY, true);
  //   expect(balanceMock).toHaveBeenLastCalledWith(fakeDelegateOwnerAddress);
  //   expect(result).toEqual({
  //     walletBalanceHot: 0n,
  //     chiefBalanceHot: 0n,
  //     chiefTotal: 0n,
  //     total: 0n
  //   });
  // });
});
