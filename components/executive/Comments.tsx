/** @jsx jsx */
import { Flex, Text, Box, Link as ExternalLink, jsx } from 'theme-ui';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';

import Stack from '../layouts/Stack';
import CommentSortBy from './CommentSortBy';
import { Comment } from 'types/comment';
import { Proposal } from 'modules/executive/types';
import { getEtherscanLink, formatAddress } from 'lib/utils';
import { formatDateWithTime } from 'lib/datetime';
import { getNetwork } from 'lib/maker';
import useUiFiltersStore from 'stores/uiFilters';

export default function CommentsTab({
  proposal,
  comments,
  ...props
}: {
  proposal: Proposal;
  comments: Comment[] | undefined;
}): JSX.Element {
  const commentSortBy = useUiFiltersStore(state => state.commentSortBy);

  const sortedComments = useMemo(() => {
    return comments?.sort((a, b) => {
      if (commentSortBy === 'Latest') {
        const aDate = a.date || 0;
        const bDate = b.date || 0;
        return aDate < bDate ? 1 : aDate === bDate ? 0 : -1;
      } else if (commentSortBy === 'MKR Amount') {
        const aWeight = new BigNumber(a.voterWeight || 0);
        const bWeight = new BigNumber(b.voterWeight || 0);
        return aWeight.lt(bWeight) ? 1 : aWeight.eq(bWeight) ? 0 : -1;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
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
        <Text variant="microHeading">Comments ({comments ? comments.length : '-'})</Text>
        <CommentSortBy />
      </Flex>
      <Stack gap={3} {...props}>
        <Box>
          {sortedComments ? (
            <Box>
              {sortedComments.map(comment => (
                <Box
                  sx={{ borderBottom: '1px solid', borderColor: 'secondaryMuted', py: 4 }}
                  key={comment.voterAddress}
                >
                  <Text variant="caps" color="textSecondary" sx={{ lineHeight: '22px' }}>
                    {formatDateWithTime(comment.date)}
                  </Text>
                  <Flex sx={{ flexDirection: 'row', mt: 1 }}>
                    <ExternalLink
                      href={getEtherscanLink(getNetwork(), comment.voterAddress, 'address')}
                      target="_blank"
                    >
                      <Text>{formatAddress(comment.voterAddress)}</Text>
                    </ExternalLink>
                    <Text variant="text" sx={{ ml: 1, fontWeight: 'normal' }}>
                      voted with {comment.voterWeight} MKR{' '}
                    </Text>
                  </Flex>
                  <Text mt={2} variant="text" color="secondaryEmphasis" sx={{ overflowWrap: 'break-word' }}>
                    {comment.comment}
                  </Text>
                </Box>
              ))}
            </Box>
          ) : (
            'Loading comments'
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
