import { Card, Heading, Box, Flex, Button, Text, Spinner, Divider } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Poll } from 'modules/polling/types';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import VotingWeight from './VotingWeight';
import PollBar from './BallotPollBar';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';

type Props = { activePolls: Poll[]; network: SupportedNetworks; polls: Poll[] };

export default function BallotBox({ activePolls, network, polls }: Props): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);

  const { transaction, ballotCount } = useContext(BallotContext);

  return (
    <Box>
      <Heading mb={2} mt={4} variant="microHeading" data-testid="your-ballot-title">
        Your Ballot
      </Heading>
      {transaction?.hash && transaction.status === 'pending' ? (
        <Card variant="compact" p={[0, 0]} sx={{ justifyContent: 'center' }}>
          <Flex sx={{ justifyContent: 'center', flexDirection: 'column' }}>
            <Spinner size={48} mt={4} sx={{ color: 'notice', alignSelf: 'center' }} />
            <Text
              mt={3}
              px={4}
              sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
            >
              Transaction Sent. Vote{ballotCount === 1 ? '' : 's'} pending.
            </Text>
            <ExternalLink
              href={getEtherscanLink(network, transaction.hash, 'transaction')}
              styles={{ p: 0 }}
              title="View on etherscan"
            >
              <Text mt={3} px={4} mb={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
                View on Etherscan
                <Icon name="arrowTopRight" pt={2} color="accentBlue" />
              </Text>
            </ExternalLink>
          </Flex>
        </Card>
      ) : (
        <Card variant="compact" p={[0, 0]}>
          <PollBar polls={polls} activePolls={activePolls} />

          <Divider />
          <Box sx={{ borderBottom: '1px solid secondaryMuted', px: 3, py: 2 }}>
            <VotingWeight />
          </Box>
          <Divider m="0" />
          <Flex p={3} sx={{ flexDirection: 'column' }}>
            <InternalLink href="/polling/review" title="Review & submit your ballot">
              <Button
                onClick={() => {
                  trackButtonClick('reviewAndSubmitBallot');
                }}
                variant="primaryLarge"
                disabled={!ballotCount}
                sx={{ width: '100%', cursor: !ballotCount ? 'not-allowed' : 'pointer' }}
              >
                Review & Submit Your Ballot
              </Button>
            </InternalLink>
          </Flex>
        </Card>
      )}
    </Box>
  );
}
