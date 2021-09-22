import { Button, Box, Flex, Text } from '@theme-ui/components';
import { Alert, Link } from 'theme-ui';
import { MKRInput } from 'components/MKRInput';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import useAccountsStore from 'stores/accounts';
import { useLockedMkr } from 'lib/hooks';
import Withdraw from 'components/executive/Withdraw';

type Props = {
  title: string;
  description: string;
  onChange: any;
  balance?: BigNumber;
  buttonLabel: string;
  onClick: () => void;
  showAlert: boolean;
};

export function InputDelegateMkr({
  title,
  description,
  onChange,
  balance,
  buttonLabel,
  onClick,
  showAlert
}: Props): React.ReactElement {
  const [value, setValue] = useState(new BigNumber(0));
  const currentAccount = useAccountsStore(state =>state.currentAccount);
  const voteProxy = useAccountsStore(state =>
    currentAccount ? state.proxies[currentAccount.address] : null
  );
  const { data: lockedMkr } = useLockedMkr(currentAccount?.address, voteProxy);
  function handleChange(val: BigNumber): void {
    setValue(val);
    onChange(val);
  }
  return (
    <Flex
      sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
    >
      <Text variant="microHeading" sx={{ fontSize: [3, 6] }}>
        {title}
      </Text>
      <Text sx={{ color: 'secondaryEmphasis', mt: 3 }}>{description}</Text>
      <Box sx={{ mt: 3, width: '20rem' }}>
        <MKRInput value={value} onChange={handleChange} balance={balance} />
        <Button onClick={onClick} sx={{ width: '100%', my: 3 }} disabled={!value || value.eq(0)}>
          {buttonLabel}
        </Button>
      </Box>
      {showAlert && lockedMkr && lockedMkr.gt(0) && balance && balance.gt(0) && (
        <Alert variant="notice" sx={{ fontWeight: 'normal'}}>
          <Text>
            {`You have ${lockedMkr.toBigNumber().toFormat(6)} additional MKR locked in the voting contract. `}
            <Withdraw link={'Withdraw MKR'}/>
            {' to deposit it into a delegate contract.'}
          </Text>
        </Alert>)
      }
      {showAlert && lockedMkr && lockedMkr.gt(0.00) && balance && balance.eq(0) && (
        <Alert variant="notice" sx={{ fontWeight: 'normal'}}>
          <Text>
            {'You must '}
            <Withdraw link={'withdraw your MKR'}/>
            {' from the voting contract before delegating it.'}
          </Text>
        </Alert>)
      }
    </Flex>
  );
}
