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
import { Poll, PollTally } from '../types';
import useAccountsStore from 'modules/app/stores/accounts';

type PollCommentWithWeight = PollComment & {
  voterWeight: BigNumber;
};

export default function PollComments({
  comments,
  tally,
  poll
}: {
  comments: PollComment[] | undefined;
  tally?: PollTally;
  poll: Poll;
}): JSX.Element {
  const [commentSortBy, setCommentSortBy] = useState('date');

  // Used to display the share button in owned comments
  const account = useAccountsStore(state => state.currentAccount);

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
        const tallyVote = tally.votesByAddress?.find(i => {
          return i.voter === c.voterAddress;
        });
        return {
          ...c,
          voterWeight: new BigNumber(tallyVote ? tallyVote.mkrSupport : 0)
        } as PollCommentWithWeight;
      });
    }
  }, [comments, tally]);

  const sortedComments = useMemo(() => {
    return mergedComments.sort((a, b) => {
      if (commentSortBy === 'Latest') {
        const aDate = a.date || 0;
        const bDate = b.date || 0;
        return aDate < bDate ? 1 : aDate === bDate ? 0 : -1;
      } else if (commentSortBy === 'MKR Amount') {
        return a.voterWeight.lt(b.voterWeight) ? 1 : a.voterWeight.eq(b.voterWeight) ? 0 : -1;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [commentSortBy, mergedComments]);

  const getTwitterMessage = (comment: PollComment) => {
    return `I voted on a MakerDAO governance poll: ${poll.title}. Learn more about this poll, here: `;
  };

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
                    {account?.address === comment.voterAddress && (
                      <ExternalLink
                        href={`https://twitter.com/intent/tweet?text=${getTwitterMessage(
                          comment
                        )}&url=${`https://vote.makerdao.com/polling/${
                          poll.slug
                        }#comments?network=${getNetwork()}`}`}
                        target="_blank"
                      >
                        <Text variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
                          Share <Icon name="twitter" size={12} ml={1} />
                        </Text>
                      </ExternalLink>
                    )}
                  </Flex>
                  <Flex sx={{ flexDirection: 'row', mt: 1 }}>
                    <ExternalLink
                      href={getEtherscanLink(getNetwork(), comment.voterAddress, 'address')}
                      target="_blank"
                    >
                      <Text>{formatAddress(comment.voterAddress)}</Text>
                    </ExternalLink>
                    <Text variant="text" sx={{ ml: 1, fontWeight: 'normal' }}>
                      voted with {comment.voterWeight.toFixed(2)} MKR{' '}
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
