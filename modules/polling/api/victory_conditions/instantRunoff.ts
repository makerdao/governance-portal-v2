import BigNumber from 'lib/bigNumberJs';
import { PollTallyVote } from 'modules/polling/types';
import {
  InstantRunoffOption,
  InstantRunoffOptions,
  InstantRunoffResults
} from 'modules/polling/types/instantRunoff';

const MAX_ROUNDS = 32;

export function extractWinnerInstantRunoff(currentVotes: PollTallyVote[]): InstantRunoffResults | null {
  let totalMKR = new BigNumber(0);
  let winner;
  let rounds = 1;

  const defaultOptionObj: InstantRunoffOption = {
    mkrSupport: new BigNumber(0),
    transfer: new BigNumber(0),
    winner: false,
    eliminated: false
  };

  const options: InstantRunoffOptions = {};

  if (currentVotes.length === 0) {
    return null;
  }

  // Run the first round
  const choiceVotes = currentVotes.map(vote => {
    totalMKR = totalMKR.plus(vote.mkrSupport);

    // take the highest preference option from each voter's ballot
    // Copy ballot to avoid modifications of the same object
    const newBallot = [...vote.ballot];
    const newVote = {
      ...vote,
      ballot: newBallot,
      choice: newBallot.shift()
    };

    if (typeof newVote.choice !== 'undefined') {
      if (!options[newVote.choice]) {
        options[newVote.choice] = { ...defaultOptionObj };
      }

      options[newVote.choice].mkrSupport = options[newVote.choice].mkrSupport.plus(newVote.mkrSupport || 0);
    }

    return newVote;
  });

  // No MKR, return no winner
  if (totalMKR.eq(0)) {
    return {
      options,
      winner: null,
      rounds
    };
  }

  // does any candidate have the majority after the first round?
  Object.entries(options).forEach(([option, { mkrSupport }]) => {
    if (mkrSupport.gt(totalMKR.div(2))) {
      winner = parseInt(option);
    }
  });

  // if so we're done; return the winner
  if (winner) {
    options[winner].winner = true;
    return {
      options,
      winner,
      rounds
    };
  }

  // if we couldn't find a winner based on first preferences, run additional rounds until we find one
  while (typeof winner === 'undefined') {
    rounds++;
    // find the weakest candidate
    const filteredOptions = Object.entries(options).filter(([, optionDetails]) => !optionDetails.eliminated);
    const [optionToEliminate] = filteredOptions.reduce((prv, cur) => {
      const [, prvVotes] = prv;
      const [, curVotes] = cur;
      if (curVotes.mkrSupport.plus(curVotes.transfer).lt(prvVotes.mkrSupport.plus(prvVotes.transfer)))
        return cur;
      return prv;
    });

    // mark the weakest as eliminated
    options[optionToEliminate].eliminated = true;

    // a vote needs to be moved if...
    // 1) it's currently for the eliminated candidate
    // 2) there's another choice further down in the voter's preference list
    const votesToBeMoved = choiceVotes
      .map((vote, index) => ({ ...vote, index }))
      .filter(vote => typeof vote.choice !== 'undefined')
      .filter(vote => parseInt(vote.choice as any as string) === parseInt(optionToEliminate))
      .filter(vote => vote.ballot[vote.ballot.length - 1] !== 0);

    // move votes to the next choice on their preference list
    votesToBeMoved.forEach(vote => {
      const prevChoice = choiceVotes[vote.index].choice;
      choiceVotes[vote.index].choice = choiceVotes[vote.index].ballot.shift();
      if (typeof choiceVotes[vote.index].choice === 'undefined') {
        return;
      }

      if (typeof options[choiceVotes[vote.index].choice as number] === 'undefined') {
        options[choiceVotes[vote.index].choice as number] = { ...defaultOptionObj };
      }

      if (options[choiceVotes[vote.index].choice as number].eliminated) {
        choiceVotes[vote.index].choice = choiceVotes[vote.index].ballot.shift();
        let validVoteFound = false;

        while (typeof choiceVotes[vote.index].choice !== 'undefined') {
          if (typeof options[choiceVotes[vote.index].choice as number] === 'undefined') {
            options[choiceVotes[vote.index].choice as number] = { ...defaultOptionObj };
          }
          if (!options[choiceVotes[vote.index].choice as number].eliminated) {
            validVoteFound = true;
            break;
          }
          choiceVotes[vote.index].choice = choiceVotes[vote.index].ballot.shift();
        }

        if (!validVoteFound) return;
      }
      if (!options[choiceVotes[vote.index].choice as number].eliminated) {
        options[choiceVotes[vote.index].choice as number].transfer = new BigNumber(
          options[choiceVotes[vote.index].choice as number].transfer
        ).plus(vote.mkrSupport || 0);

        options[prevChoice as number].transfer = new BigNumber(options[prevChoice as number].transfer).minus(
          vote.mkrSupport || 0
        );
      }
    });

    // look for a candidate with the majority
    Object.entries(options).forEach(([option, { mkrSupport, transfer }]) => {
      if (mkrSupport.plus(transfer).gt(totalMKR.div(2))) {
        winner = parseInt(option);
      }
    });

    // count the number of options that haven't been eliminated
    const remainingOptions = Object.entries(options).filter(
      ([, optionDetails]) => !optionDetails.eliminated
    ).length;

    // if there are no more rounds or if there is only one opiton remaining
    // and no winner could be found, then we end the search
    if ((rounds > MAX_ROUNDS || remainingOptions === 1) && typeof winner === 'undefined') {
      return {
        options,
        winner: null,
        rounds
      };
    }

    // sanity checks
    if (Object.keys(options).length === 2 && typeof winner === 'undefined') {
      // dead tie. this seems super unlikely, but it should be here for completeness
      // return the tally without declaring a winner
      return {
        options,
        winner: null,
        rounds
      };
    }
    if (Object.keys(options).length === 1) {
      // this shouldn't happen
      throw new Error(`Invalid ranked choice tally ${options}`);
    }
    // if we couldn't find one, go for another round
  }

  options[winner].winner = true;
  return {
    options,
    winner,
    rounds
  };
}
