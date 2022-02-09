import { Box, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Tooltip from 'modules/app/components/Tooltip';

import { getVotingWeightCopy } from 'modules/polling/helpers/getVotingWeightCopy';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';

export default function VotingWeight(): JSX.Element {
  const { account, voteDelegateContractAddress } = useAccount();

  const { data: votingWeight } = useMKRVotingWeight(account);

  // let votingWeightDescription = '';
  // if (votingWeight) {
  //   votingWeightDescription += votingWeight.proxyChiefBalance?.gte(parseUnits('0.005'))
  //     ? 'Vote proxy: ' + formatValue(votingWeight.proxyChiefBalance) + '; '
  //     : '';
  //   votingWeightDescription += votingWeight.mkrBalance.gte(parseUnits('0.005'))
  //     ? 'Connected wallet: ' + formatValue(votingWeight.mkrBalance) + '; '
  //     : '';
  //   votingWeightDescription += votingWeight.chiefBalance.gte(parseUnits('0.005'))
  //     ? 'Connected wallet chief: ' + formatValue(votingWeight.chiefBalance) + '; '
  //     : '';
  //   votingWeightDescription += votingWeight.linkedMkrBalance?.gte(parseUnits('0.005'))
  //     ? 'Linked wallet: ' + formatValue(votingWeight.linkedMkrBalance) + '; '
  //     : '';
  //   votingWeightDescription += votingWeight.linkedChiefBalance?.gte(parseUnits('0.005'))
  //     ? 'Linked wallet chief: ' + formatValue(votingWeight.linkedChiefBalance) + '; '
  //     : '';
  // }
  // votingWeightDescription = votingWeightDescription.slice(0, -2);

  const votingWeightCopy = getVotingWeightCopy(!!voteDelegateContractAddress);

  const tooltipLabel = (
    <>
      {/* {votingWeightDescription && <Box sx={{ fontWeight: 600, pb: 2 }}>{votingWeightDescription}</Box>} */}
      {votingWeightCopy}
    </>
  );

  return (
    <Flex
      sx={{
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
      <Text sx={{ color: 'text' }}>{votingWeight ? `${formatValue(votingWeight.total)} MKR` : '--'}</Text>
    </Flex>
  );
}
