import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import useSWR from 'swr';
import { Box, Text } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { CommentsAPIResponseItem } from '../types/comments';
import { formatDateWithTime } from 'lib/datetime';
import { InternalLink } from 'modules/app/components/InternalLink';

export default function AccountComments({ address }: { address: string }): React.ReactElement {
  const { network } = useWeb3();

  const { data, error, isValidating } = useSWR<{
    comments: CommentsAPIResponseItem[];
  }>(`/api/comments/${address}?network=${network}`);

  return (
    <Box>
      {isValidating && !data && (
        <Box>
          <Box mb={3}>
            <Skeleton width="100%" height={'100px'} />
          </Box>
          <Box mb={3}>
            <Skeleton width="100%" height={'100px'} />
          </Box>
          <Box mb={3}>
            <Skeleton width="100%" height={'100px'} />
          </Box>
        </Box>
      )}
      {error && (
        <Box>
          <Text>Unable to load comments.</Text>
        </Box>
      )}
      {data && data.comments.length === 0 && (
        <Box>
          <Text>No comments found.</Text>
        </Box>
      )}
      {data && data.comments.length > 0 && (
        <Box mb={3}>
          <Text
            as="p"
            variant="h2"
            sx={{
              fontSize: 4,
              fontWeight: 'semiBold'
            }}
          >
            Comments
          </Text>{' '}
          {data.comments.map(comment => (
            <Box
              sx={{ borderBottom: '1px solid', borderColor: 'secondaryMuted', py: 4 }}
              key={comment.address.address}
            >
              <Text as="p" variant="caps" sx={{ lineHeight: '22px' }}>
                {formatDateWithTime(comment.comment.date)}
              </Text>
              <Text
                sx={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: comment.comment.comment }}
              ></Text>
              <Box mt={1}>
                {comment.comment.commentType === 'executive' && (
                  <InternalLink href={`/executive/${comment.comment.spellAddress}`} title="View executive">
                    <Text sx={{ color: 'accentBlue' }}>View Executive</Text>
                  </InternalLink>
                )}
                {comment.comment.commentType === 'poll' && (
                  <InternalLink href={`/polling/${comment.comment.pollId}`} title="View poll">
                    <Text sx={{ color: 'accentBlue' }}>View Poll</Text>
                  </InternalLink>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
