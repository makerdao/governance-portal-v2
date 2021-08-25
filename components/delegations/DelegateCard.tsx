/** @jsx jsx */

import React, { useState } from 'react';
import { Card, Box, Flex, Button, Divider, Text, Link as ExternalLink, jsx } from 'theme-ui';
import Link from 'next/link';
import { getNetwork } from 'lib/maker';
import { useLockedMkr, useMkrDelegated, useVotedProposals } from 'lib/hooks';
import { limitString } from 'lib/string';
import { getEtherscanLink } from 'lib/utils';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { DelegateStatusEnum } from 'lib/delegates/constants';
import useAccountsStore from 'stores/accounts';
import { Delegate } from 'types/delegate';
import {
  DelegatePicture,
  DelegateModal,
  UndelegateModal,
  // DelegateLastVoted,
  DelegateContractExpiration
} from 'components/delegations';
import Tooltip from 'components/Tooltip';
import { CMSProposal } from 'types/proposal';

type PropTypes = {
  delegate: Delegate;
  proposals: CMSProposal[];
};

export function DelegateCard({ delegate, proposals }: PropTypes): React.ReactElement {
  const network = getNetwork();

  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
  const [account, voteDelegate] = useAccountsStore(state => [state.currentAccount, state.voteDelegate]);
  const address = account?.address;

  const { data: totalStaked } = useLockedMkr(delegate.voteDelegateAddress);
  const { data: mkrStaked } = useMkrDelegated(address, delegate.voteDelegateAddress);
  const { data: votedProposals } = useVotedProposals(delegate.voteDelegateAddress);

  const proposalsSupported: number = votedProposals?.length;

  const execSupported: CMSProposal | undefined = proposals?.find(proposal =>
    votedProposals?.find(vp => vp.toLowerCase() === proposal?.address?.toLowerCase())
  );

  const getSupportText = (): string | null => {
    if (!proposals || !votedProposals) {
      return 'Fetching executive data';
    }

    if (proposals && votedProposals && !execSupported) {
      return 'Currently no executive supported';
    }

    if (execSupported) {
      return `Currently supporting ${execSupported.title}${
        proposalsSupported > 1
          ? ` & ${proposalsSupported - 1} more proposal${proposalsSupported === 2 ? '' : 's'}`
          : ''
      }`;
    }

    return null;
  };

  const supportText = getSupportText();

  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);

  const isOwner =
    delegate.voteDelegateAddress.toLowerCase() === voteDelegate?.getVoteDelegateAddress().toLowerCase();

  const participationTooltipLabel = (
    <>
      The percentage of votes the delegate has participated in. <br />
      Combines stats for polls and executives. <br />
      Updated weekly by the GovAlpha Core Unit. <br />
    </>
  );
  const communicationTooltipLabel = (
    <>
      The percentage of votes for which the delegate has publicly <br />
      communicated their reasoning in addition to voting. <br />
      Combines stats for polls and executives. <br />
      Updated weekly by the GovAlpha Core Unit. <br />
    </>
  );

  return (
    <Card
      sx={{
        p: [0, 0],
        borderColor: isOwner ? 'onSecondary' : 'muted'
      }}
    >
      <Flex
        px={[3, 4]}
        py={[3, 4]}
        sx={{
          flexDirection: ['column', 'column', 'row', 'column', 'row']
        }}
      >
        <Flex
          sx={{
            maxWidth: ['100%', '100%', '300px', '100%', '300px'],
            flex: 1,
            flexDirection: 'column'
          }}
        >
          <Flex sx={{ mr: [0, 2] }}>
            <DelegatePicture delegate={delegate} />

            <Box sx={{ ml: 2 }}>
              <Box>
                <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {delegate.name ? limitString(delegate.name, 43, '...') : 'Unknown'}
                </Text>
              </Box>
              <ExternalLink
                title="View on etherescan"
                href={getEtherscanLink(getNetwork(), delegate.voteDelegateAddress, 'address')}
                target="_blank"
              >
                <Text>
                  {delegate.voteDelegateAddress.substr(0, 6)}...
                  {delegate.voteDelegateAddress.substr(
                    delegate.voteDelegateAddress.length - 5,
                    delegate.voteDelegateAddress.length - 1
                  )}
                </Text>
              </ExternalLink>
            </Box>
          </Flex>

          <Flex sx={{ height: '100%', mt: [3, 3, 0, 3, 0] }}>
            <Link
              href={{
                pathname: `/address/${delegate.voteDelegateAddress}`,
                query: { network }
              }}
            >
              <a sx={{ mt: 'auto' }} title="Profile details">
                <Button
                  onClick={() => trackButtonClick('openDelegateProfile')}
                  sx={{ borderColor: 'text', color: 'text' }}
                  variant="outline"
                >
                  View Profile Details
                </Button>
              </a>
            </Link>
          </Flex>
        </Flex>

        <Flex
          sx={{
            flex: 1,
            mt: [4, 4, 0, 4, 0],
            mb: [2, 2, 0, 2, 0],
            flexDirection: ['row', 'row', 'column-reverse', 'row', 'column-reverse']
          }}
        >
          <Flex
            sx={{
              flexDirection: ['column', 'column', 'row', 'column', 'row'],
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <Box sx={{ mb: [3, 3, 0, 3, 0], width: '200px' }}>
              <Text
                as="p"
                variant="microHeading"
                sx={{ fontSize: [3, 5], color: delegate.communication ? 'text' : 'secondaryMuted' }}
              >
                {delegate.combinedParticipation ?? 'Untracked'}
              </Text>
              <Tooltip label={participationTooltipLabel}>
                <Text
                  as="p"
                  variant="secondary"
                  color="onSecondary"
                  sx={{ fontSize: [2, 3], cursor: 'help' }}
                >
                  Participation
                </Text>
              </Tooltip>
            </Box>
            <Box sx={{ width: '200px' }}>
              <Text
                as="p"
                variant="microHeading"
                sx={{ fontSize: [3, 5], color: delegate.communication ? 'text' : 'secondaryMuted' }}
              >
                {delegate.communication ?? 'Untracked'}
              </Text>
              <Tooltip label={communicationTooltipLabel}>
                <Text
                  as="p"
                  variant="secondary"
                  color="onSecondary"
                  sx={{ fontSize: [2, 3], cursor: 'help' }}
                >
                  Communication
                </Text>
              </Tooltip>
            </Box>
            <Box>
              <Button
                variant="primaryOutline"
                disabled={!account}
                onClick={() => {
                  trackButtonClick('openUndelegateModal');
                  setShowUndelegateModal(true);
                }}
                sx={{ width: '150px', height: '45px', mt: [4, 4, 0, 4, 0] }}
              >
                Undelegate
              </Button>
            </Box>
          </Flex>
          <Flex
            sx={{
              flexDirection: ['column', 'column', 'row', 'column', 'row'],
              justifyContent: 'space-between',
              width: '100%',
              mb: [0, 0, 3, 0, 3]
            }}
          >
            <Box sx={{ mb: [3, 3, 0, 3, 0], width: '200px' }}>
              <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }} data-testid="total-mkr-delegated">
                {totalStaked ? totalStaked.toBigNumber().toFormat(2) : '0.00'}
              </Text>
              <Text as="p" variant="secondary" color="onSecondary" sx={{ fontSize: [2, 3] }}>
                Total MKR delegated
              </Text>
            </Box>
            <Box sx={{ width: '200px' }}>
              <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                {mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
              </Text>
              <Text as="p" variant="secondary" color="onSecondary" sx={{ fontSize: [2, 3] }}>
                MKR delegated by you
              </Text>
            </Box>
            <Box>
              <Button
                variant="primaryLarge"
                disabled={!account}
                onClick={() => {
                  trackButtonClick('openDelegateModal');
                  setShowDelegateModal(true);
                }}
                sx={{ width: '150px', height: '45px', mt: [4, 4, 0, 4, 0] }}
              >
                Delegate
              </Button>
            </Box>
          </Flex>
        </Flex>
      </Flex>
      {supportText && (
        <>
          <Divider my={1} />
          <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
            <Text as="p" sx={{ textAlign: 'center', px: [3, 4], mb: 1 }}>
              {supportText}
            </Text>
          </Flex>
        </>
      )}

      <DelegateModal
        delegate={delegate}
        isOpen={showDelegateModal}
        onDismiss={() => setShowDelegateModal(false)}
      />
      <UndelegateModal
        delegate={delegate}
        isOpen={showUndelegateModal}
        onDismiss={() => setShowUndelegateModal(false)}
      />
    </Card>
  );
}
