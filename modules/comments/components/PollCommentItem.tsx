import React from 'react';
import { getNetwork } from 'lib/maker';
import { Poll, PollTallyVote } from 'modules/polling/types';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';
import { Flex, Text, Box, Link as ExternalLink } from 'theme-ui';

import { PollCommentsAPIResponseItemWithWeight } from '../types/comments';
import CommentItem from './CommentItem';

export default function PollCommentItem({
  comment,
  commentVote,
  poll
}: {
  comment: PollCommentsAPIResponseItemWithWeight;
  commentVote: PollTallyVote | undefined;
  poll: Poll;
}): React.ReactElement {
  const getTwitterMessage = () => {
    if (!commentVote) {
      // This should not happen but in case the tally is missing
      return `I voted on "${poll.title}". View proposal: `;
    }

    const voteOptionText =
      poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE
        ? poll.options[commentVote.optionId]
        : (commentVote.rankedChoiceOption || [])
            .map((choice, index) => `${index + 1} - ${poll.options[choice]}`)
            .join(', ');

    return `I voted "${voteOptionText}" for "${poll.title}". View proposal: `;
  };

  return (
    <Box>
      <CommentItem
        comment={comment}
        twitterUrl={`https://twitter.com/intent/tweet?text=${getTwitterMessage()}&url=${`https://vote.makerdao.com/polling/${
          poll.slug
        }#comments?network=${getNetwork()}`}`}
      />
    </Box>
  );
}
