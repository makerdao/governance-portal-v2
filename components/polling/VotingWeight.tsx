/** @jsx jsx */
import { Box, Flex, Text, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Tooltip from '../Tooltip';
import useSWR from 'swr';
import useAccountsStore from '../../stores/accounts';
import getMaker from '../../lib/maker';

export default function VotingWeight(props): JSX.Element {
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

  const tooltipLabel = (
    <>
      {votingWeightDescription && <Box sx={{ fontWeight: 600, pb: 2 }}>{votingWeightDescription}</Box>}
      Your voting weight is made up of MKR in your wallet, vote proxy, and voting contract. <br />
      This amount is applied to all polls you vote on.
    </>
  );

  return (
    <Flex
      {...props}
      sx={{
        ...props.sx,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%'
      }}
    >
      <Flex sx={{ flexDirection: 'row' }}>
        <Text color="textSecondary">Voting weight</Text>
        <Tooltip label={tooltipLabel}>
          <Box>
            <Icon name="question" ml={2} mt={'6px'} />
          </Box>
        </Tooltip>
      </Flex>
      <Text sx={{ color: 'text' }}>
        {votingWeight ? `${votingWeight.total.toBigNumber().toFormat(2)} MKR` : '--'}
      </Text>
    </Flex>
  );
}
