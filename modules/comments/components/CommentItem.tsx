import React from 'react';
import { Flex, Text, Box, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Link from 'next/link';
import { formatDateWithTime } from 'lib/datetime';
import { getNetwork } from 'lib/maker';
import useAccountsStore from 'modules/app/stores/accounts';
import DelegateAvatarName from 'modules/delegates/components/DelegateAvatarName';
import AddressIconBox from 'modules/address/components/AddressIconBox';
import { ExecutiveCommentsAPIResponseItem, PollCommentsAPIResponseItemWithWeight } from '../types/comments';
import BigNumber from 'bignumber.js';
import { getEtherscanLink } from 'lib/utils';

export default function CommentItem({
  comment,
  votedOption,
  twitterUrl
}: {
  comment: PollCommentsAPIResponseItemWithWeight | ExecutiveCommentsAPIResponseItem;
  votedOption?: React.ReactNode;
  twitterUrl: string;
}): React.ReactElement {
  // TODO: Remove this once tweeting functionality gets re-enabled
  const twitterEnabled = false;

  // Used to display the share button in owned comments
  const [account, voteDelegate] = useAccountsStore(state => [state.currentAccount, state.voteDelegate]);

  // isOwner if the delegateAddress registered in the comment is the same one from the current user
  // isOwner also if the address is equal to the current account address
  const isOwner = comment.comment.delegateAddress
    ? comment.comment.delegateAddress?.toLowerCase() === voteDelegate?.getVoteDelegateAddress().toLowerCase()
    : comment.address.address.toLowerCase() === account?.address.toLowerCase();

  return (
    <Box>
      <Flex
        sx={{
          alignItems: ['flex-start', 'center'],
          justifyContent: 'space-between',
          flexDirection: ['column', 'row'],
          mb: 2
        }}
      >
        <Box>
          {comment.address && (
            <Box>
              {comment.address.isDelegate && comment.address.delegateInfo ? (
                <Box>
                  <Link
                    href={{
                      pathname: `/address/${comment.address.delegateInfo.voteDelegateAddress}`,
                      query: { network: getNetwork() }
                    }}
                    passHref
                  >
                    <ExternalLink title="Profile details" variant="nostyle">
                      <DelegateAvatarName delegate={comment.address.delegateInfo} isOwner={isOwner} />
                    </ExternalLink>
                  </Link>
                </Box>
              ) : (
                <Box>
                  <Link
                    href={{
                      pathname: `/address/${comment.address.address}`,
                      query: { network: getNetwork() }
                    }}
                    passHref
                  >
                    <ExternalLink title="Profile details" variant="nostyle">
                      <AddressIconBox
                        address={comment.address.address}
                        voteProxyInfo={comment.address.voteProxyInfo}
                        showExternalLink={false}
                      />
                    </ExternalLink>
                  </Link>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Flex sx={{ flexDirection: 'column', alignItems: ['flex-start', 'flex-end'] }}>
          <Text as="p" variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
            {formatDateWithTime(comment.comment.date)}
          </Text>
          <Text variant="smallCaps">
            {votedOption
              ? votedOption
              : `Voted with ${new BigNumber(comment.comment.voterWeight).toFixed(2)} MKR`}
          </Text>
          {comment.comment.txHash && (
            <Box>
              <ExternalLink
                target="_blank"
                href={getEtherscanLink(getNetwork(), comment.comment.txHash, 'transaction')}
                sx={{ my: 3 }}
              >
                <Text sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
                  View on Etherscan
                  <Icon name="arrowTopRight" pt={2} color="accentBlue" />
                </Text>
              </ExternalLink>
            </Box>
          )}
        </Flex>
        {account?.address === comment.comment.voterAddress && twitterEnabled && (
          <ExternalLink href={twitterUrl} target="_blank">
            <Text variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
              Share <Icon name="twitter" size={12} ml={1} />
            </Text>
          </ExternalLink>
        )}
      </Flex>

      <Text mt={2} variant="text" color="secondaryEmphasis" sx={{ overflowWrap: 'break-word' }}>
        {comment.comment.comment}
      </Text>
    </Box>
  );
}
