import { Box, Flex, Text } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { Icon } from '@makerdao/dai-ui-icons';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { formatDateWithTime } from 'lib/datetime';
import { isInputFormatRankFree } from '../helpers/utils';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import VotedOption from './VotedOption';
import { PollVoteTypeIndicator } from './PollOverviewCard/PollVoteTypeIndicator';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import CountdownTimer from 'modules/app/components/CountdownTimer';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { CHAIN_INFO } from 'modules/web3/constants/networks';

export function PollVoteHistoryItem({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const bpi = useBreakpointIndex();
  const voteDate = formatDateWithTime(vote.blockTimestamp);
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: ['column', 'row']
        }}
      >
        <Box
          sx={{
            width: ['100%', '60%'],
            mr: [0, 2]
          }}
        >
          <Flex sx={{ flexDirection: 'column' }}>
            <Text
              variant="secondary"
              color="onSecondary"
              sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold' }}
              as="p"
            >
              Voted {voteDate} | Poll ID {vote.pollId}
            </Text>
          </Flex>
          <InternalLink href={`/polling/${vote.poll.slug}`} title="View poll details">
            <Text
              as="p"
              sx={{ fontSize: '18px', fontWeight: 'semiBold', color: 'secondaryAlt', mt: 1, mb: 1 }}
            >
              {vote.poll.title}
            </Text>
          </InternalLink>
        </Box>

        <Box
          sx={{
            mt: [2, 0]
          }}
        >
          <Box>
            <Text
              variant="secondary"
              color="onSecondary"
              sx={{
                textTransform: 'uppercase',
                fontSize: 1,
                fontWeight: 'bold',
                textAlign: ['left', 'right']
              }}
              as="p"
            >
              {isInputFormatRankFree(vote.poll.parameters) ? 'VOTED CHOICES' : 'VOTED OPTION'}
            </Text>
            <VotedOption vote={vote} poll={vote.poll} align={bpi === 0 ? 'left' : 'right'} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Text
              variant="secondary"
              color="onSecondary"
              sx={{
                textTransform: 'uppercase',
                fontSize: 1,
                fontWeight: 'bold',
                textAlign: ['left', 'right']
              }}
              as="p"
            >
              Voting Weight
            </Text>
            <Text
              as="p"
              sx={{
                textAlign: ['left', 'right'],
                fontWeight: 'semiBold'
              }}
            >
              {formatValue(parseUnits(vote.mkrSupport.toString()), undefined, undefined, true, true)} MKR
            </Text>
          </Box>
        </Box>
      </Box>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Flex sx={{ alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            <ErrorBoundary componentName="Countdown Timer">
              <CountdownTimer endText="Poll ended" endDate={vote.poll.endDate} />
            </ErrorBoundary>
          </Box>
          <PollVoteTypeIndicator poll={vote.poll} />
        </Flex>

        <Box>
          <ExternalLink
            title="See transaction details"
            href={getEtherscanLink(chainIdToNetworkName(vote.chainId), vote.hash, 'transaction')}
          >
            <Flex sx={{ alignItems: 'center' }}>
              {CHAIN_INFO[vote.chainId].type === 'gasless' && (
                <Icon name="lightningBolt" color="primary" size={3} />
              )}

              <Text sx={{ mr: 1, display: 'block' }}>
                {CHAIN_INFO[vote.chainId] ? CHAIN_INFO[vote.chainId].blockExplorerName : 'Unknown'}
              </Text>
              <Icon sx={{ ml: 'auto' }} name="arrowTopRight" size={2} color="accentBlue" />
            </Flex>
          </ExternalLink>
        </Box>
      </Flex>
    </Box>
  );
}
