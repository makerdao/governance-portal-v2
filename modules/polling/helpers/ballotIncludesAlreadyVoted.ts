/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchAllCurrentVotes } from 'modules/polling/api/fetchAllCurrentVotes';
import logger from 'lib/logger';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { voteProxyFactoryAbi, voteProxyFactoryAddress } from 'modules/contracts/generated';

export async function ballotIncludesAlreadyVoted(
  voter: string,
  network: SupportedNetworks,
  pollIds: string[]
): Promise<boolean> {
  try {
    const chainId = networkNameToChainId(network);

    const [voteDelegateAddress, voteProxyAddress] = await Promise.all([
      getDelegateContractAddress(voter, chainId),
      getVoteProxyAddresses(voteProxyFactoryAddress[chainId], voteProxyFactoryAbi, voter, network)
    ]);

    const addressToUseAsVoter = voteDelegateAddress
      ? voteDelegateAddress
      : voteProxyAddress?.hotAddress
      ? voteProxyAddress?.hotAddress
      : voter;

    const voteHistory = await fetchAllCurrentVotes(addressToUseAsVoter, network);
    const votedPollIds = voteHistory.map(v => v.pollId);
    const areUnvoted = pollIds.map(pollId => !votedPollIds.includes(parseInt(pollId)));

    return areUnvoted.includes(false);
  } catch (err) {
    logger.error(err);

    // something went wrong, fail the check
    return true;
  }
}
