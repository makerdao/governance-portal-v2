/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Card, Heading, Box, Flex, Button, Text, Spinner, Divider } from 'theme-ui';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import VotingWeight from './VotingWeight';
import PollBar from './BallotPollBar';
import { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';
import { InternalLink } from 'modules/app/components/InternalLink';
import EtherscanLink from 'modules/web3/components/EtherscanLink';

type Props = {
  activePollCount: number;
  network: SupportedNetworks;
  activePollIds: number[];
};

export default function BallotBox({ activePollCount, network, activePollIds }: Props): JSX.Element {
  const { transaction, ballotCount, clearBallot } = useContext(BallotContext);

  return (
    <Box sx={{ mb: 3 }}>
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

            <EtherscanLink hash={transaction.hash} type="transaction" network={network} />
          </Flex>
        </Card>
      ) : (
        <Card variant="compact" p={[0, 0]}>
          <PollBar activePollCount={activePollCount} activePollIds={activePollIds} />

          <Divider />
          <Box sx={{ borderBottom: '1px solid secondaryMuted', px: 3, py: 2 }}>
            <VotingWeight />
          </Box>
          <Divider m="0" />
          <Flex p={3} sx={{ flexDirection: 'column' }}>
            <Button
              variant="primaryLarge"
              disabled={!ballotCount}
              sx={{ width: '100%', cursor: !ballotCount ? 'not-allowed' : 'pointer' }}
            >
              <InternalLink href="/polling/review" title="Review & submit your ballot">
                <>Review & Submit Your Ballot</>
              </InternalLink>
            </Button>

            {ballotCount > 0 && (
              <Button
                variant="mutedOutline"
                sx={{ width: '100%', cursor: 'pointer', mt: 2 }}
                onClick={clearBallot}
              >
                Clear Ballot
              </Button>
            )}
          </Flex>
        </Card>
      )}
    </Box>
  );
}
