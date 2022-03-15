import { Flex } from 'theme-ui';
import { StatBox } from 'modules/app/components/StatBox';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { formatValue } from 'lib/string';

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
      <StatBox value={votingWeight ? formatValue(votingWeight.total) : '0.000'} label={'Total MKR Balance'} />

      <StatBox
        styles={{
          textAlign: 'right'
        }}
        value={totalMKRDelegated ? totalMKRDelegated.toFixed(2) : '0.00'}
        label={'Total MKR Delegated'}
      />
    </Flex>
  );
}
