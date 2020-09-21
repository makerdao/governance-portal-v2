import { Box, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Tooltip from '@reach/tooltip';
import useSWR from 'swr';
import useAccountsStore from '../../stores/accounts';
import getMaker from '../../lib/maker';

export default function (props): JSX.Element {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: votingWeight } = useSWR(
    account?.address ? ['/user/polling-voting-weight', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getMkrWeightFromChain(address))
  );
  let votingWeightDescription = '';
  if (votingWeight) {
    votingWeightDescription += votingWeight.proxyChiefBalance?.gte(0.005)
      ? 'Vote proxy: ' + votingWeight.proxyChiefBalance.toString() + '; '
      : '';
    votingWeightDescription += votingWeight.mkrBalance.gte(0.005)
      ? 'Connected wallet: ' + votingWeight.mkrBalance.toString() + '; '
      : '';
    votingWeightDescription += votingWeight.chiefBalance.gte(0.005)
      ? 'Connected wallet chief: ' + votingWeight.chiefBalance.toString() + '; '
      : '';
    votingWeightDescription += votingWeight.linkedMkrBalance?.gte(0.005)
      ? 'Linked wallet: ' + votingWeight.linkedMkrBalance.toString() + '; '
      : '';
    votingWeightDescription += votingWeight.linkedChiefBalance?.gte(0.005)
      ? 'Linked wallet chief: ' + votingWeight.linkedChiefBalance.toString() + '; '
      : '';
  }
  votingWeightDescription = votingWeightDescription.slice(0, -2);

  return (
    <Flex
      {...props}
      sx={{
        ...props.sx,
        // justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexDirection: 'column',
        mt: 3,
        width: '100%'
      }}
    >
      <Flex sx={{ flexDirection: 'row' }}>
        <Text color="onSecondary" sx={{ fontWeight: 'bold', fontSize: '12px' }}>
          POLLING VOTING WEIGHT
        </Text>
        {votingWeightDescription ? (
          <Tooltip sx={{ mt: -1 }} label={votingWeightDescription}>
            <Box>
              <Icon name="question" ml={1} mt={1} sx={{ paddingTop: '3px' }} />
            </Box>
          </Tooltip>
        ) : null}
      </Flex>
      <Text sx={{ color: 'text' }}>{votingWeight ? `${votingWeight.total.toString()}` : '--'}</Text>
      <Text sx={{ color: 'onSecondary', mt: 2 }}>
        Your voting weight is made up of MKR in your wallet, vote proxy, and voting contract. This amount is
        applied to all polls you vote on.
      </Text>
    </Flex>
  );
}
