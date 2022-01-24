import BigNumber from 'bignumber.js';
import { Flex } from 'theme-ui';
import { useMkrDelegated } from 'modules/mkr/hooks/useMkrDelegated';
import { Delegate } from 'modules/delegates/types';
import { StatBox } from 'modules/app/components/StatBox';
import { useAccount } from 'modules/app/hooks/useAccount';

export function DelegateMKRDelegatedStats({
  delegate,
  delegatorCount
}: {
  delegate: Delegate;
  delegatorCount?: number;
}): React.ReactElement {
  const { account } = useAccount();
  // TODO: Fetch addresses suporting through API fetching

  const { data: mkrStaked } = useMkrDelegated(account, delegate.voteDelegateAddress);

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
        value={new BigNumber(delegate.mkrDelegated).toFormat(3) ?? 'Untracked'}
        label={'Total MKR Delegated'}
      />
      <StatBox
        value={typeof delegatorCount !== 'undefined' ? new BigNumber(delegatorCount).toFormat(0) : '--'}
        label={'Total Active Delegators'}
      />
      <StatBox
        value={typeof mkrStaked !== 'undefined' ? mkrStaked.toBigNumber().toFormat(3) : '0.000'}
        label={'MKR Delegated by you'}
      />
    </Flex>
  );
}
