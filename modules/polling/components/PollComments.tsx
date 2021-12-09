import { Flex, Text, Box, Link as ExternalLink } from 'theme-ui';
import { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Icon } from '@makerdao/dai-ui-icons';

import Stack from 'modules/app/components/layout/layouts/Stack';
import { getEtherscanLink, formatAddress } from 'lib/utils';
import { formatDateWithTime } from 'lib/datetime';
import { getNetwork } from 'lib/maker';
import { MenuItem } from '@reach/menu-button';
import FilterButton from 'modules/app/components/FilterButton';
import { PollComment } from '../types/pollComments';
export default function PollComments({ comments }: { comments: PollComment[] | undefined }): JSX.Element {
  const [commentSortBy, setCommentSortBy] = useState('date');

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

  const twitterMessage = `I voted on this poll ${'e'}`;
  return (
    <Stack gap={3} sx={{ p: 4 }}>
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
        <Box>
          <FilterButton
            name={() => `Sort by ${commentSortBy !== 'Latest' ? commentSortBy : 'latest'}`}
            listVariant="menubuttons.default.list"
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
                  <Flex
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
                      {formatDateWithTime(comment.date)}
                    </Text>
                    <ExternalLink
                      href={`https://twitter.com/intent/tweet?text=${twitterMessage}`}
                      target="_blank"
                    >
                      <Text variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
                        Share <Icon name="twitter" size={12} ml={1} />
                      </Text>
                    </ExternalLink>
                  </Flex>
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
            'No comments added to this poll.'
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
