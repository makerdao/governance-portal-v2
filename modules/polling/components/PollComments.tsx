import { Flex, Text, Box } from 'theme-ui';
import { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';

import Stack from 'modules/app/components/layout/layouts/Stack';
import { MenuItem } from '@reach/menu-button';
import FilterButton from 'modules/app/components/FilterButton';
import { PollComment, PollCommentWithWeight } from '../types/pollComments';
import { Poll, PollTally, PollTallyVote } from '../types';
import PollCommentItem from './PollCommentItem';

export default function PollComments({
  comments,
  tally,
  poll
}: {
  comments: PollComment[] | undefined;
  tally?: PollTally;
  poll: Poll;
}): JSX.Element {
  const [commentSortBy, setCommentSortBy] = useState('latest');

  const getCommentVote = (comment: PollComment): PollTallyVote | undefined => {
    const tallyVote = tally.votesByAddress?.find(i => {
      return i.voter === comment.voterAddress;
    });
    return tallyVote;
  };

  // Merge comments with voting weight from the tally. Used for sorting by MKR weight and representation
  const mergedComments: PollCommentWithWeight[] = useMemo(() => {
    if (!comments) {
      return [];
    }
    if (!tally) {
      return comments?.map(
        c =>
          ({
            ...c,
            voterWeight: new BigNumber(0)
          } as PollCommentWithWeight)
      );
    } else {
      return comments?.map(c => {
        const tallyVote = getCommentVote(c);
        return {
          ...c,
          voterWeight: new BigNumber(tallyVote ? tallyVote.mkrSupport : 0)
        } as PollCommentWithWeight;
      });
    }
  }, [comments, tally]);

  const sortedComments = useMemo(() => {
    return mergedComments.sort((a, b) => {
      if (commentSortBy === 'latest') {
        const aDate = new Date(a.date).getTime() || 0;
        const bDate = new Date(b.date).getTime() || 0;
        return aDate < bDate ? 1 : aDate === bDate ? 0 : -1;
      } else if (commentSortBy === 'MKR Amount') {
        return a.voterWeight.lt(b.voterWeight) ? 1 : a.voterWeight.eq(b.voterWeight) ? 0 : -1;
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [commentSortBy, mergedComments]);

  return (
    <Stack gap={3} sx={{ p: [3, 4] }}>
      <Flex
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'secondaryMuted',
          pb: 3,
          alignItems: 'center'
        }}
      >
        <Text
          variant="microHeading"
          sx={{
            fontSize: [2, 4]
          }}
        >
          Comments ({comments ? comments.length : '-'})
        </Text>
        <Box>
          <FilterButton name={() => `Sort by ${commentSortBy}`} listVariant="menubuttons.default.list">
            <MenuItem
              onSelect={() => setCommentSortBy('latest')}
              sx={{
                variant: 'menubuttons.default.item',
                fontWeight: commentSortBy === 'latest' ? 'bold' : undefined
              }}
            >
              Latest
            </MenuItem>
            <MenuItem
              onSelect={() => setCommentSortBy('oldest')}
              sx={{
                variant: 'menubuttons.default.item',
                fontWeight: commentSortBy === 'oldest' ? 'bold' : undefined
              }}
            >
              Oldest
            </MenuItem>
            <MenuItem
              onSelect={() => setCommentSortBy('MKR Amount')}
              sx={{
                variant: 'menubuttons.default.item',
                fontWeight: commentSortBy === 'MKR Amount' ? 'bold' : undefined
              }}
            >
              MKR Amount
            </MenuItem>
          </FilterButton>
        </Box>
      </Flex>
      <Stack gap={3}>
        <Box>
          {sortedComments ? (
            <Box>
              {sortedComments.map(comment => (
                <Box
                  sx={{
                    ':not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'secondaryMuted' },
                    py: 4
                  }}
                  key={comment.voterAddress}
                >
                  <PollCommentItem comment={comment} commentVote={getCommentVote(comment)} poll={poll} />
                </Box>
              ))}
            </Box>
          ) : (
            'No comments added to this poll.'
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
