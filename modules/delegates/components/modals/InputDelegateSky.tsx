/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Alert, Button, Box, Flex, Text } from 'theme-ui';
import { MKRInput } from 'modules/mkr/components/MKRInput';
import { useState } from 'react';
import { useLockedSky } from 'modules/mkr/hooks/useLockedSky';
import Withdraw from 'modules/mkr/components/Withdraw';
import { useAccount } from 'modules/app/hooks/useAccount';
import { formatValue } from 'lib/string';
import { parseEther } from 'viem';

type Props = {
  title: string;
  description: string;
  disclaimer?: JSX.Element;
  onChange: (val: bigint) => void;
  balance?: bigint;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
  showAlert: boolean;
};

export function InputDelegateSky({
  title,
  description,
  onChange,
  balance,
  buttonLabel,
  onClick,
  disabled = false,
  showAlert,
  disclaimer
}: Props): React.ReactElement {
  const [value, setValue] = useState(0n);
  const { account } = useAccount();
  const { data: lockedSky } = useLockedSky(account);
  function handleChange(val: bigint): void {
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
        <Button
          onClick={onClick}
          sx={{ width: '100%', my: 3 }}
          disabled={!value || !balance || value === 0n || value > balance || disabled}
          data-testid="deposit-mkr-modal-button"
        >
          {buttonLabel}
        </Button>
        {disclaimer}
      </Box>
      {showAlert && lockedSky && lockedSky >= parseEther('0.1') && balance && balance > 0n && (
        <Alert variant="notice" sx={{ fontWeight: 'normal' }}>
          <Text>
            {`You have ${formatValue(lockedSky)} additional SKY locked in the voting contract. `}
            <Withdraw link={'Withdraw SKY'} />
            {' to deposit it into a delegate contract.'}
          </Text>
        </Alert>
      )}
      {showAlert && lockedSky && lockedSky > 0n && balance && balance === 0n && (
        <Alert variant="notice" sx={{ fontWeight: 'normal' }}>
          <Text>
            {'You must '}
            <Withdraw link={'withdraw your SKY'} />
            {' from the voting contract before delegating it.'}
          </Text>
        </Alert>
      )}
    </Flex>
  );
}
