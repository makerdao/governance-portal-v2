/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchAllCurrentVotes } from 'modules/polling/api/fetchAllCurrentVotes';
import logger from 'lib/logger';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';

export async function ballotIncludesAlreadyVoted(
  voter: string,
  network: SupportedNetworks,
  pollIds: string[]
): Promise<boolean> {
  try {
    const chainId = networkNameToChainId(network);

    const voteDelegateAddress = await getDelegateContractAddress(voter, chainId);

    const addressToUseAsVoter = voteDelegateAddress ? voteDelegateAddress : voter;

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
