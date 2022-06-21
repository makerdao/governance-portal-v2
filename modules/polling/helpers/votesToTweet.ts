import { objectToGetParams } from 'lib/utils';

// TODO type this
export const votesToTweet = ({
  modalPollId,
  previousBallot,
  previousVotesLength,
  previousVotedPolls
}: {
  previousBallot: any;
  modalPollId: any;
  previousVotedPolls: any;
  previousVotesLength: any;
}): string => {
  let url = '';
  let text = '';
  if (modalPollId) {
    // single vote
    const poll = previousVotedPolls.find(poll => poll.pollId === modalPollId);
    if (!poll) return '';
    const option = poll.options[previousBallot[poll.pollId].option as number];
    url = `https://vote.makerdao.com/polling/${poll.slug}`;
    text = `I just voted ${
      option ? option + ' ' : ''
    }on a MakerDAO governance poll! Learn more about the poll on the Governance Portal:`;
  } else {
    // all votes
    url = 'https://vote.makerdao.com';
    text = `I just voted on ${previousVotesLength > 1 ? previousVotesLength : 'a'} MakerDAO governance poll${
      previousVotesLength > 1 ? 's' : ''
    }! Find my votes and all Maker governance proposals on the Governance Portal:`;
  }

  return (
    'https://twitter.com/share' +
    objectToGetParams({
      url,
      text
    })
  );
};
