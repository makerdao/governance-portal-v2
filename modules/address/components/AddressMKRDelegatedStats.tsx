import BigNumber from 'bignumber.js';
import { Flex } from 'theme-ui';
import { StatBox } from 'modules/app/components/StatBox';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';

export function AddressMKRDelegatedStats({
  totalMKRDelegated,
  address
}: {
  totalMKRDelegated?: number;
  address: string;
}): React.ReactElement {
  const { data: mkrBalance } = useMkrBalance(address);

  return (
    <Flex
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: ['column', 'row'],
        marginTop: 1,
        marginBottom: 1
      }}
    >
      <StatBox
        value={mkrBalance ? mkrBalance.toBigNumber().toFormat(2) : '0.00'}
        label={'Total MKR Balance'}
      />

      <StatBox
        styles={{
          textAlign: 'right'
        }}
        value={totalMKRDelegated ? new BigNumber(totalMKRDelegated).toFormat(2) : '0.00'}
        label={'Total MKR Delegated'}
      />
    </Flex>
  );
}
