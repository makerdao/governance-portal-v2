/** @jsx jsx */
import { Flex, Text, Box, Link as ExternalLink, jsx } from 'theme-ui';

import Stack from '../layouts/Stack';
import CommentDateFilter from './CommentDateFilter';
import Comment from '../../types/comment';

export default function OnComments({ ...props }: { comments: Comment[] }): JSX.Element {
  const comments = [
    {
      voterAddress: '0x',
      voterWeight: '1,500.50',
      comment: 'blah blah blah blah blah blah blah',
      date: new Date()
    },
    {
      voterAddress: '0x',
      voterWeight: '1,500.50',
      comment: 'blah blah blah blah blah blah blah',
      date: new Date()
    }
  ];
  return (
    <Stack gap={3}>
      {/* <Header stateDiff={stateDiff} /> */}
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
        <Text variant="microHeading">Comments ({comments.length})</Text>
        <CommentDateFilter />
      </Flex>
      <Stack gap={3} {...props}>
        <Box>
          {comments ? (
            <Box>
              {comments.map(comment => (
                <Box
                  sx={{ borderBottom: '1px solid', borderColor: 'secondaryMuted', py: 4 }}
                  key={Math.random()}
                >
                  <Text variant="caps" color="textSecondary" sx={{ lineHeight: '22px' }}>
                    {comment.date.toString()}
                  </Text>
                  <Flex sx={{ flexDirection: 'row', mt: 1 }}>
                    <ExternalLink
                      href={`https://etherscan.io/address/${comment.voterAddress}`}
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
