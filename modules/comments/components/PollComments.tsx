/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Text, Box } from 'theme-ui';
import { useMemo, useState } from 'react';

import Stack from 'modules/app/components/layout/layouts/Stack';
import { MenuItem } from '@reach/menu-button';
import FilterButton from 'modules/app/components/FilterButton';
import { Poll, PollTally, PollTallyVote } from '../../polling/types';
import PollCommentItem from './PollCommentItem';
import {
  PollCommentsAPIResponseItem,
  PollCommentsAPIResponseItemWithWeight,
  CommentSortOption
} from 'modules/comments/types/comments';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

export default function PollComments({
  comments,
  tally,
  poll
}: {
  comments: PollCommentsAPIResponseItem[] | undefined;
  tally?: PollTally;
  poll: Poll;
}): JSX.Element {
  const [commentSortBy, setCommentSortBy] = useState(CommentSortOption.MKR_AMOUNT);

  const getCommentVote = (item: PollCommentsAPIResponseItem): PollTallyVote | undefined => {
    const tallyVote = tally?.votesByAddress?.find(i => {
      // Get the right voting weight by looking at the proxy contract, delegate address or normal address
      return (
        i.voter.toLowerCase() === item.address.delegateInfo?.voteDelegateAddress.toLowerCase() ||
        i.voter.toLowerCase() === item.address.voteProxyInfo?.voteProxyAddress?.toLowerCase() ||
        i.voter.toLowerCase() === item.address.address
      );
    });
    return tallyVote;
  };

  // Merge comments with voting weight from the tally. Used for sorting by MKR weight and representation
  const mergedComments: PollCommentsAPIResponseItemWithWeight[] = useMemo(() => {
    if (!comments) {
      return [];
    }
    if (!tally) {
      return comments?.map(c => ({
        ...c,
        comment: {
          ...c.comment,
          voterWeight: BigNumber.from(0)
        }
      }));
    } else {
      return comments?.map(c => {
        const tallyVote = getCommentVote(c);
        return {
          ...c,
          comment: {
            ...c.comment,
            voterWeight: parseUnits(tallyVote ? tallyVote.mkrSupport.toString() : '0')
          }
        };
      });
    }
  }, [comments, tally]);

  const sortedComments = useMemo(() => {
    return mergedComments.sort((a, b) => {
      if (commentSortBy === CommentSortOption.LATEST) {
        const aDate = new Date(a.comment.date).getTime() || 0;
        const bDate = new Date(b.comment.date).getTime() || 0;
        return aDate < bDate ? 1 : aDate === bDate ? 0 : -1;
      } else if (commentSortBy === CommentSortOption.MKR_AMOUNT) {
        return a.comment.voterWeight.lt(b.comment.voterWeight)
          ? 1
          : a.comment.voterWeight.eq(b.comment.voterWeight)
          ? 0
          : -1;
      }

      return new Date(a.comment.date).getTime() > new Date(b.comment.date).getTime() ? 1 : -1;
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
          Comments ({comments ? comments.length : '0'})
        </Text>
        <Box>
          <FilterButton name={() => `Sort by ${commentSortBy}`} listVariant="menubuttons.default.list">
            <MenuItem
              onSelect={() => setCommentSortBy(CommentSortOption.LATEST)}
              sx={{
                variant: 'menubuttons.default.item',
                fontWeight: commentSortBy === CommentSortOption.LATEST ? 'bold' : undefined
              }}
            >
              Latest
            </MenuItem>
            <MenuItem
              onSelect={() => setCommentSortBy(CommentSortOption.OLDEST)}
              sx={{
                variant: 'menubuttons.default.item',
                fontWeight: commentSortBy === CommentSortOption.OLDEST ? 'bold' : undefined
              }}
            >
              Oldest
            </MenuItem>
            <MenuItem
              onSelect={() => setCommentSortBy(CommentSortOption.MKR_AMOUNT)}
              sx={{
                variant: 'menubuttons.default.item',
                fontWeight: commentSortBy === CommentSortOption.MKR_AMOUNT ? 'bold' : undefined
              }}
            >
              MKR Amount
            </MenuItem>
          </FilterButton>
        </Box>
      </Flex>
      <Stack gap={3}>
        <Box>
          {sortedComments && sortedComments.length > 0 ? (
            <Box>
              {sortedComments.map(comment => (
                <Box
                  sx={{
                    ':not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'secondaryMuted' },
                    py: 4
                  }}
                  key={comment.comment.voterAddress + comment.comment.date}
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
