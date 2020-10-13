/** @jsx jsx */
import { Flex, Text, Box, Link as ExternalLink, jsx } from 'theme-ui';

import Stack from '../layouts/Stack';
import CommentSortBy from './CommentSortBy';
import Comment from '../../types/comment';
import Proposal from '../../types/proposal';
import { getEtherscanLink } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';

export default function CommentsTab({
  proposal,
  comments,
  ...props
}: {
  proposal: Proposal;
  comments: Comment[];
}): JSX.Element {
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
          {comments ? (
            <Box>
              {comments.map(comment => (
                <Box
                  sx={{ borderBottom: '1px solid', borderColor: 'secondaryMuted', py: 4 }}
                  key={comment.voterAddress}
                >
                  <Text variant="caps" color="textSecondary" sx={{ lineHeight: '22px' }}>
                    {comment.date.toString()}
                  </Text>
                  <Flex sx={{ flexDirection: 'row', mt: 1 }}>
                    <ExternalLink
                      href={getEtherscanLink(getNetwork(), comment.voterAddress, 'address')}
                      target="_blank"
                    >
                      <Text>{comment.voterAddress}</Text>
                    </ExternalLink>
                    <Text variant="text" sx={{ ml: 1 }}>
                      voted with {comment.voterWeight} MKR{' '}
                    </Text>
                  </Flex>
                  <Text mt={2} variant="text" color="secondaryEmphasis">
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
