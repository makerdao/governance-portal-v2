import { Flex, Text, Box } from 'theme-ui';
import { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';

import Stack from 'modules/app/components/layout/layouts/Stack';
import { Proposal } from '../../executive/types';
import FilterButton from 'modules/app/components/FilterButton';
import { MenuItem } from '@reach/menu-button';
import { ParsedExecutiveComments } from '../types/comments';
import CommentItem from './CommentItem';

export default function ExecutiveComments({
  proposal,
  comments,
  ...props
}: {
  proposal: Proposal;
  comments: ParsedExecutiveComments[] | undefined;
}): JSX.Element {
  const [commentSortBy, setCommentSortBy] = useState('latest');
  const sortedComments = useMemo(() => {
    return (comments || []).sort((a, b) => {
      if (commentSortBy === 'Latest') {
        const aDate = a.comment.date || 0;
        const bDate = b.comment.date || 0;
        return aDate < bDate ? 1 : aDate === bDate ? 0 : -1;
      } else if (commentSortBy === 'MKR Amount') {
        const aWeight = new BigNumber(a.comment.voterWeight || 0);
        const bWeight = new BigNumber(b.comment.voterWeight || 0);
        return aWeight.lt(bWeight) ? 1 : aWeight.eq(bWeight) ? 0 : -1;
      }
      return new Date(b.comment.date).getTime() - new Date(a.comment.date).getTime();
    });
  }, [commentSortBy, comments]);

  return (
    <Stack gap={3}>
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
        <Text variant="microHeading">Comments ({comments ? comments.length : '0'})</Text>
        <Box>
          <FilterButton
            name={() => `Sort by ${commentSortBy !== 'Latest' ? commentSortBy : 'latest'}`}
            listVariant="menubuttons.default.list"
            {...props}
          >
            <MenuItem
              onSelect={() => setCommentSortBy('Latest')}
              sx={{
                variant: 'menubuttons.default.item',
                fontWeight: commentSortBy === 'Latest' ? 'bold' : undefined
              }}
            >
              Latest
            </MenuItem>
            <MenuItem
              onSelect={() => setCommentSortBy('Oldest')}
              sx={{
                variant: 'menubuttons.default.item',
                fontWeight: commentSortBy === 'Oldest' ? 'bold' : undefined
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
      <Stack gap={3} {...props}>
        <Box>
          {sortedComments && sortedComments.length > 0 ? (
            <Box>
              {sortedComments.map(comment => (
                <Box
                  sx={{ borderBottom: '1px solid', borderColor: 'secondaryMuted', py: 4 }}
                  key={comment.address.address}
                >
                  <CommentItem comment={comment} twitterUrl="" />
                </Box>
              ))}
            </Box>
          ) : (
            'No comments for this proposal.'
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
