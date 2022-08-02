import React from 'react';
import { Poll, PollTallyVote } from 'modules/polling/types';
import { Text, Box } from 'theme-ui';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';

import { PollCommentsAPIResponseItemWithWeight } from '../types/comments';
import CommentItem from './CommentItem';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import { isResultDisplaySingleVoteBreakdown } from 'modules/polling/helpers/utils';
import { RankedChoiceVoteSummary } from 'modules/polling/components/RankedChoiceVoteSummary';

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

    const voteOptionText = isResultDisplaySingleVoteBreakdown(poll.parameters) ? (
      <Text sx={{ color: getVoteColor(commentVote.ballot[0], poll.parameters.inputFormat.type) }}>
        {poll.options[commentVote.ballot[0]]}
      </Text>
    ) : (
      <Box>
        <RankedChoiceVoteSummary choices={commentVote.ballot || []} poll={poll} />
      </Box>
    );

    return (
      <Text>
        Voted {voteOptionText} with{' '}
        {formatValue(comment.comment.voterWeight, undefined, undefined, true, true)} MKR
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
