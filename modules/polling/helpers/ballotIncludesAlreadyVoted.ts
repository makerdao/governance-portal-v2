import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import logger from 'lib/logger';

export async function ballotIncludesAlreadyVoted(
  voter: string,
  network: SupportedNetworks,
  pollIds: string[]
): Promise<boolean> {
  try {
    const voteHistory = await fetchAddressPollVoteHistory(voter, network);
    const votedPollIds = voteHistory.map(v => v.pollId);
    const areUnvoted = pollIds.map(pollId => !votedPollIds.includes(parseInt(pollId)));

    return areUnvoted.includes(false);
  } catch (err) {
    logger.error(err);

    // something went wrong, fail the check
    return true;
  }
}
