import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';
import Link from 'next/link';
import { Box, Text, Link as InternalLink } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { ExecutiveCommentsAPIResponseItem, PollCommentsAPIResponseItem } from '../types/comments';
import { formatDateWithTime } from 'lib/datetime';

export default function AccountComments({ address }: { address: string }): React.ReactElement {
  const { network } = useActiveWeb3React();

  const { data, error, isValidating } = useSWR<{
    executive: ExecutiveCommentsAPIResponseItem[];
    polling: PollCommentsAPIResponseItem[];
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
      {data && data.executive.length === 0 && data.polling.length === 0 && (
        <Box>
          <Text>No comments found.</Text>
        </Box>
      )}
      {data && data.executive.length > 0 && (
        <Box mb={3}>
          <Text
            as="p"
            variant="h2"
            sx={{
              fontSize: 4,
              fontWeight: 'semiBold'
            }}
          >
            Executive Comments
          </Text>{' '}
          {data.executive.map(comment => (
            <Box
              sx={{ borderBottom: '1px solid', borderColor: 'secondaryMuted', py: 4 }}
              key={comment.address.address}
            >
              <Text as="p" variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
                {formatDateWithTime(comment.comment.date)}
              </Text>
              <Text sx={{ wordBreak: 'break-word' }}>{comment.comment.comment}</Text>
              <Box mt={1}>
                <Link href={`/executive/${comment.comment.spellAddress}`} passHref>
                  <InternalLink variant="nostyle">
                    <Text sx={{ color: 'accentBlue' }}>View Executive</Text>
                  </InternalLink>
                </Link>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {data && data.polling.length > 0 && (
        <Box>
          <Text
            as="p"
            variant="h2"
            sx={{
              fontSize: 4,
              fontWeight: 'semiBold'
            }}
          >
            Poll Comments
          </Text>{' '}
          {data.polling.map(comment => (
            <Box
              sx={{ borderBottom: '1px solid', borderColor: 'secondaryMuted', py: 4 }}
              key={comment.address.address}
            >
              <Text as="p" variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
                {formatDateWithTime(comment.comment.date)}
              </Text>
              <Text sx={{ wordBreak: 'break-word' }}>{comment.comment.comment}</Text>
              <Box mt={1}>
                <Link href={`/polling/${comment.comment.pollId}`} passHref>
                  <InternalLink variant="nostyle">
                    <Text sx={{ color: 'accentBlue' }}>View Poll</Text>
                  </InternalLink>
                </Link>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
