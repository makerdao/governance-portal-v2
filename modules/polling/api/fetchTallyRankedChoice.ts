import BigNumber from 'bignumber.js';
import { paddedArray, toBuffer } from 'lib/utils';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { voteMkrWeightsAtTimeRankedChoice } from 'modules/gql/queries/voteMkrWeightsAtTimeRankedChoice';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { RawPollTallyRankedChoice } from '../types';
import { fetchSpockPollById } from './fetchPollBy';

const MAX_ROUNDS = 32;

export async function fetchTallyRankedChoice(
  pollId: number,
  network: SupportedNetworks
): Promise<RawPollTallyRankedChoice | null> {
  const poll = await fetchSpockPollById(pollId, network);

  if (!poll) {
    return null;
  }

  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: voteMkrWeightsAtTimeRankedChoice,
    variables: {
      argPollId: pollId,
      argUnix: poll.endDate
    }
  });

  const votesRaw: { optionIdRaw: string; mkrSupport: number }[] = data.voteMkrWeightsAtTimeRankedChoice.nodes;

  // plus ballot to votes
  const votes: { optionIdRaw: string; mkrSupport: number; choice: number | undefined; ballot: number[] }[] =
    votesRaw.map(vote => {
      const ballotBuffer = toBuffer(vote.optionIdRaw, { endian: 'little' });
      const ballot = paddedArray(32 - ballotBuffer.length, ballotBuffer);

      return {
        ...vote,
        choice: undefined,
        ballot
      };
    });

  const totalMkrParticipation = votes.reduce(
    (acc, cur) => new BigNumber(cur.mkrSupport || 0).plus(acc),
    new BigNumber(0)
  );

  const tally: RawPollTallyRankedChoice = {
    rounds: 1,
    winner: null,
    totalMkrParticipation: totalMkrParticipation,
    options: {},
    numVoters: votes.length,
  };

  // if there are no votes, don't do anything
  if (votes.length === 0) {
    return tally;
  }

  const defaultOptionObj = {
    firstChoice: new BigNumber(0),
    transfer: new BigNumber(0),
    winner: false,
    eliminated: false
  };

  // run the first round
  votes.forEach(vote => {
    // take the highest preference option from each voter's ballot
    vote.choice = vote.ballot.pop();

    if (typeof vote.choice !== 'undefined') {
      if (!tally.options[vote.choice]) {
        tally.options[vote.choice] = { ...defaultOptionObj };
      }

      tally.options[vote.choice].firstChoice = tally.options[vote.choice].firstChoice.plus(
        vote.mkrSupport || 0
      );
    }
  });

  // does any candidate have the majority after the first round?
  Object.entries(tally.options).forEach(([option, { firstChoice }]) => {
    if (firstChoice.gt(totalMkrParticipation.div(2))) tally.winner = option;
  });

  // if so we're done; return the winner
  if (tally.winner) {
    tally.options[tally.winner].winner = true;
    return tally;
  }

  // if we couldn't find a winner based on first preferences, run additional rounds until we find one
  while (!tally.winner) {
    tally.rounds++;
    // find the weakest candidate
    const filteredOptions = Object.entries(tally.options).filter(
      ([, optionDetails]) => !optionDetails.eliminated
    );
    const [optionToEliminate] = filteredOptions.reduce((prv, cur) => {
      const [, prvVotes] = prv;
      const [, curVotes] = cur;
      if (curVotes.firstChoice.plus(curVotes.transfer).lt(prvVotes.firstChoice.plus(prvVotes.transfer)))
        return cur;
      return prv;
    });

    // mark the weakest as eliminated
    tally.options[optionToEliminate].eliminated = true;

    // a vote needs to be moved if...
    // 1) it's currently for the eliminated candidate
    // 2) there's another choice further down in the voter's preference list
    const votesToBeMoved = votes
      .map((vote, index) => ({ ...vote, index }))
      .filter(vote => typeof vote.choice !== 'undefined')
      .filter(vote => parseInt(vote.choice as any as string) === parseInt(optionToEliminate))
      .filter(vote => vote.ballot[vote.ballot.length - 1] !== 0);

    // move votes to the next choice on their preference list
    votesToBeMoved.forEach(vote => {
      const prevChoice = votes[vote.index].choice;
      votes[vote.index].choice = votes[vote.index].ballot.pop();
      if (!tally.options[votes[vote.index].choice as number])
        tally.options[votes[vote.index].choice as number] = { ...defaultOptionObj };

      if (tally.options[votes[vote.index].choice as number].eliminated) {
        votes[vote.index].choice = votes[vote.index].ballot.pop();
        let validVoteFound = false;

        while (votes[vote.index].choice !== 0) {
          if (!tally.options[votes[vote.index].choice as number])
            tally.options[votes[vote.index].choice as number] = { ...defaultOptionObj };
          if (!tally.options[votes[vote.index].choice as number].eliminated) {
            validVoteFound = true;
            break;
          }
          votes[vote.index].choice = votes[vote.index].ballot.pop();
        }

        if (!validVoteFound) return;
      }
      if (!tally.options[votes[vote.index].choice as number].eliminated) {
        tally.options[votes[vote.index].choice as number].transfer = new BigNumber(
          tally.options[votes[vote.index].choice as number].transfer
        ).plus(vote.mkrSupport || 0);

        tally.options[prevChoice as number].transfer = new BigNumber(
          tally.options[prevChoice as number].transfer
        ).minus(vote.mkrSupport || 0);
      }
    });

    // look for a candidate with the majority
    Object.entries(tally.options).forEach(([option, { firstChoice, transfer }]) => {
      if (firstChoice.plus(transfer).gt(totalMkrParticipation.div(2))) tally.winner = option;
    });

    // count the number of options that haven't been eliminated
    const remainingOptions = Object.entries(tally.options).filter(
      ([, optionDetails]) => !optionDetails.eliminated
    ).length;

    // if there are no more rounds or if there is only one opiton remaining
    // and no winner could be found, then we end the search
    if ((tally.rounds > MAX_ROUNDS || remainingOptions === 1) && !tally.winner) {
      return tally;
    }

    // sanity checks
    if (Object.keys(tally.options).length === 2 && !tally.winner) {
      // dead tie. this seems super unlikely, but it should be here for completeness
      // return the tally without declaring a winner
      return tally;
    }
    if (Object.keys(tally.options).length === 1) {
      // this shouldn't happen
      throw new Error(`Invalid ranked choice tally ${tally.options}`);
    }
    // if we couldn't find one, go for another round
  }

  tally.options[tally.winner].winner = true;
  return tally;
}
