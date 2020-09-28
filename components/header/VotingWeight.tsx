import { Flex, Text } from 'theme-ui';
import useSWR from 'swr';
import useAccountsStore from '../../stores/accounts';
import getMaker from '../../lib/maker';

export default function (props): JSX.Element {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: votingWeight } = useSWR(
    account?.address ? ['/user/polling-voting-weight', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getMkrWeightFromChain(address))
  );

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
          Your voting weight is made up of the MKR in your wallet, vote proxy, and voting contract. This
          amount is applied to all polls you vote on.
        </Text>
      </Flex>
    </>
  );
}
