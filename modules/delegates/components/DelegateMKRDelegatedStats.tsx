import BigNumber from 'bignumber.js';
import { Flex } from 'theme-ui';
import { useMkrDelegated } from 'modules/mkr/hooks/useMkrDelegated';
import { Delegate } from 'modules/delegates/types';
import { StatBox } from 'modules/app/components/StatBox';
import useAccountsStore from 'stores/accounts';

export function DelegateMKRDelegatedStats({ delegate }: { delegate: Delegate }): React.ReactElement {
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;

  // TODO: Fetch addresses suporting through API fetching

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
      {/* <StatBox value={'TBD'} label={'Delegators (wallets)'} />*/}
      <StatBox
        value={mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
        label={'MKR Delegated by you'}
      />
    </Flex>
  );
}
