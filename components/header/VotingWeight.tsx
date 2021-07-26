import { Flex, Text } from 'theme-ui';
import useSWR from 'swr';
import useAccountsStore from 'stores/accounts';
import getMaker from 'lib/maker';
import { getVotingWeightCopy } from 'lib/polling/getVotingWeightCopy';

export default function VotingWeight(props): JSX.Element {
  const [address, isActingAsDelegate] = useAccountsStore(state => [
    state.activeAddress,
    state.isActingAsDelegate
  ]);

  const { data: votingWeight } = useSWR(
    address ? ['/user/polling-voting-weight', address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getMkrWeightFromChain(address))
  );

  const votingWeightCopy = getVotingWeightCopy(isActingAsDelegate);

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
