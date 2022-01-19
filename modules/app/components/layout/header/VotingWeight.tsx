import { Flex, Text } from 'theme-ui';
import useAccountsStore from 'modules/app/stores/accounts';
import { getVotingWeightCopy } from 'modules/polling/helpers/getVotingWeightCopy';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { useVoteDelegateAddress } from 'modules/app/hooks/useVoteDelegateAddress';

export default function VotingWeight(props): JSX.Element {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: voteDelegateAddress } = useVoteDelegateAddress();
  const addressToCheck = voteDelegateAddress ?? account?.address;
  const { data: votingWeight } = useMKRVotingWeight(addressToCheck);

  const votingWeightCopy = getVotingWeightCopy(!!voteDelegateAddress);

  return (
    <>
      <Flex {...props} sx={{ justifyContent: 'space-between' }}>
        <Text color="textSecondary" variant="caps" sx={{ pt: 4, fontSize: 1, fontWeight: '600' }}>
          polling voting weight
        </Text>
      </Flex>
      <Flex>
        <Text sx={{ fontSize: 5 }}>
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
