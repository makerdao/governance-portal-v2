import { Flex, Text } from 'theme-ui';
import { getVotingWeightCopy } from 'modules/polling/helpers/getVotingWeightCopy';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { useAccount } from 'modules/app/hooks/useAccount';

export default function VotingWeight(props): JSX.Element {
  const { account, voteDelegateContractAddress } = useAccount();
  const { data: votingWeight } = useMKRVotingWeight(
    voteDelegateContractAddress ? voteDelegateContractAddress : account
  );

  const votingWeightCopy = getVotingWeightCopy(!!voteDelegateContractAddress);
  return (
    <>
      <Flex {...props} sx={{ justifyContent: 'space-between' }}>
        <Text color="textSecondary" variant="caps" sx={{ pt: 4, fontSize: 1, fontWeight: '600' }}>
          polling voting weight
        </Text>
      </Flex>
      <Flex>
        <Text sx={{ fontSize: 5 }} data-testid="polling-voting-weight">
          {votingWeight ? `${votingWeight.total.toBigNumber().toFormat(2)} MKR` : '--'}
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
