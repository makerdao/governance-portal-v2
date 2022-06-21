import React from 'react';
import { Box } from 'theme-ui';
import CommentTextBox from 'modules/comments/components/CommentTextBox';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import { Poll } from 'modules/polling/types/index';

type Props = {
  poll: Poll;
  onCommentChange: any;
  transactionStatus: any;
  fetchComment;
};

export const BallotPollCard = React.memo(
  ({ poll, onCommentChange, transactionStatus, fetchComment }: Props) => {
    const value = fetchComment(poll.pollId) || '';

    return (
      <Box key={poll.slug} sx={{ mb: 3 }}>
        <PollOverviewCard poll={poll} reviewPage={true} showVoting={true}>
          <Box sx={{ pt: 2 }}>
            <CommentTextBox
              onChange={e => onCommentChange(e, poll.pollId)}
              value={value}
              disabled={transactionStatus === 'pending' || transactionStatus === 'initialized'}
            />
          </Box>
        </PollOverviewCard>
      </Box>
    );
  }
);
