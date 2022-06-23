import { Box, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { StatBox } from 'modules/app/components/StatBox';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { formatValue } from 'lib/string';
import Tooltip from 'modules/app/components/Tooltip';
import { getDescription } from 'modules/polling/components/VotingWeight';
import { formatMkrAmount } from 'lib/utils';

export function AddressMKRDelegatedStats({
  totalMKRDelegated,
  address
}: {
  totalMKRDelegated?: number;
  address: string;
}): React.ReactElement {
  const { data: votingWeight } = useMKRVotingWeight(address);

  return (
    <Flex
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 1,
        marginBottom: 1
      }}
    >
      <StatBox
        value={
          votingWeight ? formatMkrAmount(formatValue(votingWeight.total, undefined, undefined, false)) : '0'
        }
        label={'Total MKR Balance'}
        tooltip={
          <Tooltip label={getDescription({ votingWeight, isDelegate: false })}>
            <Box>
              <Icon sx={{ ml: 1 }} name="question" />
            </Box>
          </Tooltip>
        }
      />

      <StatBox
        styles={{
          textAlign: 'right'
        }}
        value={totalMKRDelegated ? formatMkrAmount(totalMKRDelegated) : '0'}
        label={'Total MKR Delegated'}
      />
    </Flex>
  );
}
