import React from 'react';
import { PollCommentWithWeight } from '../types/pollComments';
import { Flex, Text, Box, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { formatAddress } from 'lib/utils';
import Link from 'next/link';
import { formatDateWithTime } from 'lib/datetime';
import { getNetwork } from 'lib/maker';
import { Poll, PollTallyVote } from '../types';
import useAccountsStore from 'modules/app/stores/accounts';
import { POLL_VOTE_TYPE } from '../polling.constants';

export default function PollCommentItem({
  comment,
  commentVote,
  poll
}: {
  comment: PollCommentWithWeight;
  commentVote: PollTallyVote | undefined;
  poll: Poll;
}): React.ReactElement {
  // TODO: Remove this once tweeting functionality gets re-enabled
  const twitterEnabled = false;

  // Used to display the share button in owned comments
  const account = useAccountsStore(state => state.currentAccount);

  const getTwitterMessage = () => {
    if (!commentVote) {
      // This should not happen but in case the tally is missing
      return `I voted on "${poll.title}". View proposal: `;
    }

    const voteOptionText =
      poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE
        ? poll.options[commentVote.optionId]
        : (commentVote.rankedChoiceOption || [])
            .map((choice, index) => `${index + 1} - ${poll.options[choice]}`)
            .join(', ');

    return `I voted "${voteOptionText}" for "${poll.title}". View proposal: `;
  };

  return (
    <Box>
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
          {formatDateWithTime(comment.date)}
        </Text>
        {account?.address === comment.voterAddress && twitterEnabled && (
          <ExternalLink
            href={`https://twitter.com/intent/tweet?text=${getTwitterMessage(
              comment
            )}&url=${`https://vote.makerdao.com/polling/${poll.slug}#comments?network=${getNetwork()}`}`}
            target="_blank"
          >
            <Text variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
              Share <Icon name="twitter" size={12} ml={1} />
            </Text>
          </ExternalLink>
        )}
      </Flex>
      <Flex sx={{ flexDirection: 'row', mt: 1 }}>
        <Link href={`/address/${comment.voterAddress}?network=${getNetwork()}`} passHref>
          <ExternalLink>
            <Text>{formatAddress(comment.voterAddress)}</Text>
          </ExternalLink>
        </Link>

        <Text variant="text" sx={{ ml: 1, fontWeight: 'normal' }}>
          voted with {comment.voterWeight.toFixed(2)} MKR{' '}
        </Text>
      </Flex>
      <Text mt={2} variant="text" color="secondaryEmphasis" sx={{ overflowWrap: 'break-word' }}>
        {comment.comment}
      </Text>
    </Box>
  );
}
