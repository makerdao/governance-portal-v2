import { getNumberWithOrdinal } from 'lib/utils';

// TODO type this
export const votesToMarkdown = ({
  previousBallot,
  modalPollId,
  previousVotedPolls
}: {
  previousBallot: any;
  modalPollId: any;
  previousVotedPolls: any;
}): string => {
  let markdown = '';
  let polls;
  if (modalPollId) {
    // single vote
    polls = [previousVotedPolls.find(poll => poll.pollId === modalPollId)];
  } else {
    // all votes
    polls = previousVotedPolls;
  }
  polls.map(poll => {
    const optionData = previousBallot[poll.pollId].option;
    let option;
    if (typeof optionData === 'number') {
      option = `**${poll.options[optionData]}**`;
    } else {
      const markdownArray = (optionData as number[]).map(
        (id, index) => `**${getNumberWithOrdinal(index + 1)} choice:** ${poll.options[id]}  \n`
      );
      option = markdownArray.reduce((previousValue, currentValue) => previousValue + currentValue);
    }
    const comment = previousBallot[poll.pollId]?.comment;
    markdown += `[${poll.title}](https://vote.makerdao.com/polling/${poll.slug}) ([thread](${poll.discussionLink}))  \n`;
    if (option) markdown += `Voted: ${option}  \n`;
    markdown += comment ? `Reasoning: ${comment}  \n` : '  \n';
    markdown += '  \n';
  });
  return markdown;
};
