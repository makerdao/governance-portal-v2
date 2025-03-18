/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Button, Box, Flex, Text } from '@theme-ui/components';
import { Alert } from 'theme-ui';
import { MKRInput } from 'modules/mkr/components/MKRInput';
import { useState } from 'react';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import Withdraw from 'modules/mkr/components/Withdraw';
import { useAccount } from 'modules/app/hooks/useAccount';
import { formatValue } from 'lib/string';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

type Props = {
  title: string;
  description: string;
  disclaimer?: JSX.Element;
  onChange: (val: BigNumber) => void;
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
  showAlert,
  disclaimer
}: Props): React.ReactElement {
  const [value, setValue] = useState(BigNumber.from(0));
  const { account, voteProxyContractAddress } = useAccount();
  const { data: lockedMkr } = useLockedMkr(voteProxyContractAddress || account);
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
        <Button
          onClick={onClick}
          sx={{ width: '100%', my: 3 }}
          disabled={!value || !balance || value.eq(0) || value.gt(balance)}
          data-testid="deposit-mkr-modal-button"
        >
          {buttonLabel}
        </Button>
        {disclaimer}
      </Box>
      {showAlert && lockedMkr && lockedMkr.gte(parseUnits('0.1')) && balance && balance.gt(0) && (
        <Alert variant="notice" sx={{ fontWeight: 'normal' }}>
          <Text>
            {`You have ${formatValue(lockedMkr)} additional MKR locked in the voting contract. `}
            <Withdraw link={'Withdraw MKR'} />
            {' to deposit it into a delegate contract.'}
          </Text>
        </Alert>
      )}
      {showAlert && lockedMkr && lockedMkr.gt(0) && balance && balance.eq(0) && (
        <Alert variant="notice" sx={{ fontWeight: 'normal' }}>
          <Text>
            {'You must '}
            <Withdraw link={'withdraw your MKR'} />
            {' from the voting contract before delegating it.'}
          </Text>
        </Alert>
      )}
    </Flex>
  );
}
