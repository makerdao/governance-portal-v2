import { Flex, Text } from 'theme-ui';
import { getVotingWeightCopy } from 'modules/polling/helpers/getVotingWeightCopy';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { useAccount } from 'modules/app/hooks/useAccount';
import { formatValue } from 'lib/string';

export default function VotingWeight(): JSX.Element {
  const { account, voteDelegateContractAddress } = useAccount();
  const { data: votingWeight } = useMKRVotingWeight(account);
  const votingWeightCopy = getVotingWeightCopy(!!voteDelegateContractAddress);

  return (
    <>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Text color="textSecondary" variant="caps" sx={{ pt: 4, fontSize: 1, fontWeight: '600' }}>
          polling voting weight
        </Text>
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
