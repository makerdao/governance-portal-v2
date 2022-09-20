import React from 'react';
import { Poll, PollTallyVote } from 'modules/polling/types';
import { Text, Box } from 'theme-ui';

import { PollCommentsAPIResponseItemWithWeight } from '../types/comments';
import CommentItem from './CommentItem';
import { formatValue } from 'lib/string';

import VotedOption from 'modules/polling/components/VotedOption';
import { useBreakpointIndex } from '@theme-ui/match-media';

export default function PollCommentItem({
  comment,
  commentVote,
  poll
}: {
  comment: PollCommentsAPIResponseItemWithWeight;
  commentVote: PollTallyVote | undefined;
  poll: Poll;
}): React.ReactElement {
  const bpi = useBreakpointIndex();

  const getVotedOption = () => {
    if (!commentVote) {
      // This should not happen but in case the tally is missing
      return 'Voted';
    }

    return (
      <Text>
        Voted {<VotedOption vote={commentVote} poll={poll} align={bpi > 0 ? 'right' : 'left'} />}
        with {formatValue(comment.comment.voterWeight, undefined, undefined, true, true)} MKR
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
