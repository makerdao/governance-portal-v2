import React from 'react';
import { Flex, Text, Box } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { formatDateWithTime } from 'lib/datetime';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import DelegateAvatarName from 'modules/delegates/components/DelegateAvatarName';
import AddressIconBox from 'modules/address/components/AddressIconBox';
import { ParsedExecutiveComments, PollCommentsAPIResponseItemWithWeight } from '../types/comments';
import BigNumber from 'bignumber.js';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
// import { useAccount } from 'modules/app/hooks/useAccount';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';

export default function CommentItem({
  comment,
  votedOption
}: // twitterUrl
{
  comment: PollCommentsAPIResponseItemWithWeight | ParsedExecutiveComments;
  votedOption?: React.ReactNode;
  // twitterUrl: string;
}): React.ReactElement {
  // TODO: Remove this once tweeting functionality gets re-enabled
  // const twitterEnabled = false;

  const { network } = useActiveWeb3React();

  // Used to display the share button in owned comments
  // const { account } = useAccount();

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
                  <InternalLink
                    href={`/address/${comment.address.delegateInfo.voteDelegateAddress}`}
                    title="View profile details"
                  >
                    <DelegateAvatarName delegate={comment.address.delegateInfo} />
                  </InternalLink>
                </Box>
              ) : (
                <Box>
                  <InternalLink href={`/address/${comment.address.address}`} title="Profile details">
                    <AddressIconBox address={comment.address.address} showExternalLink={false} />
                  </InternalLink>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Flex
          sx={{
            flexDirection: 'column',
            alignItems: ['flex-start', 'flex-end'],
            maxWidth: ['100%', '265px'],
            textAlign: ['left', 'right']
          }}
        >
          <Text as="p" variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
            {formatDateWithTime(comment.comment.date)}
          </Text>
          <Text variant="smallCaps">
            {votedOption
              ? votedOption
              : `Voted with ${
                  comment.comment.voterWeight.isGreaterThanOrEqualTo(0.01)
                    ? new BigNumber(comment.comment.voterWeight).toFixed(2)
                    : '≈0.00'
                } MKR`}
          </Text>
          {comment.comment.txHash && (
            <Box>
              <ExternalLink
                href={getEtherscanLink(network, comment.comment.txHash, 'transaction')}
                styles={{ my: 3 }}
                title="View on etherscan"
              >
                <Text sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
                  View on Etherscan
                  <Icon name="arrowTopRight" pt={2} color="accentBlue" />
                </Text>
              </ExternalLink>
            </Box>
          )}
        </Flex>
        {/* {account?.toLowerCase() === comment.comment.voterAddress.toLowerCase() && twitterEnabled && (
          <ExternalLink href={twitterUrl} title="Share on twitter">
            <Text variant="caps" color="textMuted" sx={{ lineHeight: '22px' }}>
              Share <Icon name="twitter" size={12} ml={1} />
            </Text>
          </ExternalLink>
        )} */}
      </Flex>

      <Text
        mt={2}
        variant="text"
        color="secondaryEmphasis"
        sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: comment.comment.comment }}
      ></Text>
    </Box>
  );
}
