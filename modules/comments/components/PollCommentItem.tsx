import React from 'react';
import { Poll, PollTallyVote } from 'modules/polling/types';
import { Text, Box } from 'theme-ui';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';

import { PollCommentsAPIResponseItemWithWeight } from '../types/comments';
import CommentItem from './CommentItem';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import { isInputFormatSingleChoice } from 'modules/polling/helpers/utils';

export default function PollCommentItem({
  comment,
  commentVote,
  poll
}: {
  comment: PollCommentsAPIResponseItemWithWeight;
  commentVote: PollTallyVote | undefined;
  poll: Poll;
}): React.ReactElement {
  const getVotedOption = () => {
    if (!commentVote) {
      // This should not happen but in case the tally is missing
      return 'Voted';
    }

    const voteOptionText = isInputFormatSingleChoice(poll.parameters) ? (
      <Text sx={{ color: getVoteColor(commentVote.optionId, poll.parameters.inputFormat) }}>
        {poll.options[commentVote.optionId]}
      </Text>
    ) : (
      (commentVote.rankedChoiceOption || [])
        .map((choice, index) => `${index + 1} - ${poll.options[choice]}`)
        .join(', ')
    );

    return (
      <Text>
        Voted {voteOptionText} with{' '}
        {comment.comment.voterWeight.gte(parseUnits('0.01'))
          ? formatValue(comment.comment.voterWeight)
          : '≈0.00'}{' '}
        MKR
      </Text>
    );
  };

  return (
    <Box>
      <CommentItem
        comment={comment}
        votedOption={getVotedOption()}
        // twitterUrl={`https://twitter.com/intent/tweet?text=${getTwitterMessage()}&url=${`https://vote.makerdao.com/polling/${poll.slug}#comments?network=${network}`}`}
      />
    </Box>
  );
}
