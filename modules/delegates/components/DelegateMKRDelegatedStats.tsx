import BigNumber from 'bignumber.js';
import { useMkrDelegated } from 'lib/hooks';
import useAccountsStore from 'stores/accounts';
import { Flex, jsx } from 'theme-ui';
import { Delegate } from 'modules/delegates/types';
import { StatBox } from 'modules/app/components/StatBox';

export function DelegateMKRDelegatedStats({ delegate }: { delegate: Delegate }): React.ReactElement {
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;

  const { data: mkrStaked } = useMkrDelegated(address, delegate.voteDelegateAddress);

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
        value={new BigNumber(delegate.mkrDelegated).toFormat(2) ?? 'Untracked'}
        label={'Total MKR Delegated'}
      />
      {/* TODO add once we have data */}
      {/* <StatBox value={'TBD'} label={'MKR Holders represented'} /> */}
      <StatBox
        value={mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
        label={'MKR Delegated by you'}
      />
    </Flex>
  );
}
