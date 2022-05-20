import { Box, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { getPollingVotingWeightCopy } from 'modules/polling/helpers/getPollingVotingWeightCopy';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { useAccount } from 'modules/app/hooks/useAccount';
import { formatValue } from 'lib/string';
import Tooltip from '../../Tooltip';
import { getDescription } from 'modules/polling/components/VotingWeight';

export default function VotingWeight(): JSX.Element {
  const { account, voteDelegateContractAddress } = useAccount();
  const { data: votingWeight } = useMKRVotingWeight(account);
  const votingWeightCopy = getPollingVotingWeightCopy(!!voteDelegateContractAddress);

  return (
    <>
      <Flex sx={{ pt: 4, alignItems: 'center', gap: 2 }}>
        <Text color="textSecondary" variant="caps" sx={{ fontSize: 1, fontWeight: '600' }}>
          polling voting weight
        </Text>
        <Tooltip label={getDescription(votingWeight)}>
          <Box>
            <Icon name="question" />
          </Box>
        </Tooltip>
      </Flex>
      <Flex>
        <Text sx={{ fontSize: 5 }} data-testid="polling-voting-weight">
          {votingWeight ? `${formatValue(votingWeight.total)} MKR` : '--'}
        </Text>
      </Flex>
      <Flex sx={{ py: 1 }}>
        <Text sx={{ fontSize: 2 }} color="textSecondary">
          {votingWeightCopy}
        </Text>
      </Flex>
    </>
  );
}
