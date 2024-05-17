/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getMKRVotingWeight } from './getMKRVotingWeight';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { BigNumber } from 'ethers';

jest.mock('modules/web3/helpers/getContracts');
jest.mock('modules/delegates/helpers/getDelegateContractAddress');
jest.mock('modules/app/helpers/getVoteProxyAddresses');

describe('getMKRVotingWeight', () => {
  const fakeDelegateOwnerAddress = '0x9999567890123456789012345678901234567890';
  const fakeDelegateAddress = '0x1234567890123456789012345678901234567890';
  const balanceMock = jest.fn().mockImplementation(address => {
    if (address === fakeDelegateAddress) {
      return Promise.resolve(BigNumber.from(100));
    }
    return Promise.resolve(BigNumber.from(0));
  });
  beforeAll(() => {
    (getContracts as jest.Mock).mockReturnValue({
      mkr: {
        balanceOf: balanceMock
      },
      chief: {
        deposits: () => Promise.resolve(BigNumber.from(0))
      }
    });

    (getDelegateContractAddress as jest.Mock).mockReturnValue(undefined);

    (getVoteProxyAddresses as jest.Mock).mockReturnValue({});
  });

  it('should return 0 if no MKR is locked', async () => {
    const result = await getMKRVotingWeight(fakeDelegateOwnerAddress, SupportedNetworks.TENDERLY, false);
    expect(balanceMock).toHaveBeenLastCalledWith(fakeDelegateOwnerAddress);
    expect(result).toEqual({
      walletBalanceHot: BigNumber.from(0),
      chiefBalanceHot: BigNumber.from(0),
      chiefTotal: BigNumber.from(0),
      total: BigNumber.from(0)
    });
  });

  it('should include the delegate contract weight by default', async () => {
    (getDelegateContractAddress as jest.Mock).mockReturnValue(fakeDelegateAddress);
    const result = await getMKRVotingWeight(fakeDelegateOwnerAddress, SupportedNetworks.TENDERLY, false);
    expect(balanceMock).toHaveBeenLastCalledWith(fakeDelegateAddress);
    expect(result).toEqual({
      walletBalanceHot: BigNumber.from(100),
      chiefBalanceHot: BigNumber.from(0),
      chiefTotal: BigNumber.from(0),
      total: BigNumber.from(100)
    });
  });

  it('should exclude the delegate contract weight if param is true', async () => {
    (getDelegateContractAddress as jest.Mock).mockReturnValue(fakeDelegateAddress);
    const result = await getMKRVotingWeight(fakeDelegateOwnerAddress, SupportedNetworks.TENDERLY, true);
    expect(balanceMock).toHaveBeenLastCalledWith(fakeDelegateOwnerAddress);
    expect(result).toEqual({
      walletBalanceHot: BigNumber.from(0),
      chiefBalanceHot: BigNumber.from(0),
      chiefTotal: BigNumber.from(0),
      total: BigNumber.from(0)
    });
  });
});
