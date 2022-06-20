import { Flex, Text, Box } from 'theme-ui';
import { useMemo, useState } from 'react';

import Stack from 'modules/app/components/layout/layouts/Stack';
import FilterButton from 'modules/app/components/FilterButton';
import { MenuItem } from '@reach/menu-button';
import { ParsedExecutiveComments, CommentSortOption } from '../types/comments';
import CommentItem from './CommentItem';

export default function ExecutiveComments({
  comments,
  ...props
}: {
  comments: ParsedExecutiveComments[] | undefined;
}): JSX.Element {
  const [commentSortBy, setCommentSortBy] = useState(CommentSortOption.MKR_AMOUNT);
  const sortedComments = useMemo(() => {
    return (comments || []).sort((a, b) => {
      if (commentSortBy === CommentSortOption.LATEST) {
        const aDate = a.comment.date || 0;
        const bDate = b.comment.date || 0;
        return aDate < bDate ? 1 : aDate === bDate ? 0 : -1;
      } else if (commentSortBy === CommentSortOption.MKR_AMOUNT) {
        return a.comment.voterWeight.lt(b.comment.voterWeight)
          ? 1
          : a.comment.voterWeight.eq(b.comment.voterWeight)
          ? 0
          : -1;
      }
      return new Date(a.comment.date).getTime() < new Date(b.comment.date).getTime() ? -1 : 1;
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
            name={() =>
              `Sort by ${
                commentSortBy !== CommentSortOption.LATEST ? commentSortBy : CommentSortOption.LATEST
              }`
            }
            listVariant="menubuttons.default.list"
            {...props}
          >
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
      <Stack gap={3} {...props}>
        <Box>
          {sortedComments && sortedComments.length > 0 ? (
            <Box>
              {sortedComments.map((comment, i) => (
                <Box
                  sx={{
                    borderBottom: sortedComments.length - 1 !== i ? '1px solid' : 'none',
                    borderColor: 'secondaryMuted',
                    py: 4
                  }}
                  key={comment.address.address}
                >
                  <CommentItem comment={comment} />
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
