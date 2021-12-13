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
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { DelegatePicture } from 'modules/delegates/components';
import DelegateAvatarName from 'modules/delegates/components/DelegateAvatarName';
import AddressIconBox from 'modules/address/components/AddressIconBox';

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
  const [account, voteDelegate] = useAccountsStore(state => [state.currentAccount, state.voteDelegate]);

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

  const { data: commenterData } = useSWR<AddressApiResponse>(
    `/api/address/${
      comment.delegateAddress ? comment.delegateAddress : comment.voterAddress
    }?network=${getNetwork()}`,
    fetchJson
  );
  const isOwner = comment.delegateAddress
    ? comment.delegateAddress.toLowerCase() === voteDelegate?.getVoteDelegateAddress().toLowerCase()
    : false;

  return (
    <Box>
      <Flex
        sx={{
          alignItems: ['flex-start', 'center'],
          justifyContent: 'space-between',
          flexDirection: ['column', 'row']
        }}
      >
        <Box>
          {commenterData && (
            <Box>
              {commenterData.isDelegate && commenterData.delegateInfo ? (
                <Box>
                  <Link
                    href={{
                      pathname: `/address/${commenterData.delegateInfo.voteDelegateAddress}`,
                      query: { network: getNetwork() }
                    }}
                    passHref
                  >
                    <ExternalLink title="Profile details" variant="nostyle">
                      <DelegateAvatarName delegate={commenterData.delegateInfo} isOwner={isOwner} />
                    </ExternalLink>
                  </Link>
                </Box>
              ) : (
                <Box>
                  <Link
                    href={{
                      pathname: `/address/${comment.voterAddress}`,
                      query: { network: getNetwork() }
                    }}
                    passHref
                  >
                    <ExternalLink title="Profile details" variant="nostyle">
                      <AddressIconBox
                        address={comment.voterAddress}
                        voteProxyInfo={commenterData.voteProxyInfo}
                        showExternalLink={false}
                      />
                    </ExternalLink>
                  </Link>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Box>
          <Text as="p" variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
            {formatDateWithTime(comment.date)}
          </Text>
          <Text variant="smallCaps">Voted with {comment.voterWeight.toFixed(2)} MKR </Text>
        </Box>
        {account?.address === comment.voterAddress && twitterEnabled && (
          <ExternalLink
            href={`https://twitter.com/intent/tweet?text=${getTwitterMessage()}&url=${`https://vote.makerdao.com/polling/${
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

      <Text mt={2} variant="text" color="secondaryEmphasis" sx={{ overflowWrap: 'break-word' }}>
        {comment.comment}
      </Text>
    </Box>
  );
}
