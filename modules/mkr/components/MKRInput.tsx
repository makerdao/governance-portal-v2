import { useState } from 'react';
import { Input, Text, Button, Box, Flex } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import BigNumber from 'bignumber.js';

export type MKRInputProps = {
  placeholder?: string;
  onChange: (value: BigNumber) => void;
  min?: BigNumber;
  max?: BigNumber;
  balance?: BigNumber;
  balanceText?: string;
  errorMaxMessage?: string;
  value: BigNumber;
};

export function MKRInput({
  placeholder = '0.00 MKR',
  errorMaxMessage = 'MKR balance too low',
  onChange,
  min = new BigNumber(0),
  max,
  balance,
  balanceText = 'MKR Balance:',
  value
}: MKRInputProps): React.ReactElement {
  const [currentValueStr, setCurrentValueStr] = useState('');
  const [errorInvalidFormat, setErrorInvalidFormat] = useState(false);

  function updateValue(e: { currentTarget: { value: string } }) {
    const newValueStr = e.currentTarget.value;

    setCurrentValueStr(newValueStr);

    const newValue = new BigNumber(newValueStr || '0');

    const invalidValue = newValue.lt(min) || (max && newValue.gt(max));
    if (invalidValue || newValue.isNaN()) {
      setErrorInvalidFormat(true);
      return;
    }

    setErrorInvalidFormat(false);

    onChange(newValue);
  }

  const disabledButton = balance === undefined;

  const onClickSetMax = () => {
    const val = balance ? balance : new BigNumber(0);
    onChange(val);
    setCurrentValueStr(val.toString());
  };

  const errorMax = value !== undefined && value.isGreaterThan(balance || new BigNumber(0));
  const errorMin = value !== undefined && value.isLessThan(0);

  return (
    <Box data-testid="mkr-input-wrapper">
      <Flex sx={{ border: '1px solid #D8E0E3', justifyContent: 'space-between' }}>
        <Input
          aria-label="mkr-input"
          data-testid="mkr-input"
          type="number"
          onChange={updateValue}
          value={currentValueStr}
          placeholder={placeholder}
          lang="en" // Forces dot for decimals
          sx={{
            border: 'none',
            color: 'text'
          }}
        />
        <Button
          disabled={disabledButton}
          variant="textual"
          data-testid="mkr-input-set-max"
          sx={{ width: '80px', fontWeight: 'bold', paddingLeft: 0 }}
          onClick={onClickSetMax}
          title="Set max"
        >
          Set max
        </Button>
      </Flex>
      <Flex sx={{ alignItems: 'baseline', mb: 3, alignSelf: 'flex-start' }}>
        <Text
          sx={{
            textTransform: 'uppercase',
            color: 'secondaryEmphasis',
            fontSize: 1,
            fontWeight: 'bold'
          }}
          data-testid="mkr-input-balance-text"
        >
          {balanceText}&nbsp;
        </Text>

        {balance ? (
          <Text
            sx={{ cursor: 'pointer', fontSize: 2, mt: 2 }}
            onClick={onClickSetMax}
            data-testid="mkr-input-balance"
          >
            {balance.toFormat(6)}
          </Text>
        ) : (
          <Box sx={{ width: 6 }}>
            <Skeleton />
          </Box>
        )}
      </Flex>

      {errorMax && (
        <Text sx={{ color: 'error', fontSize: 2 }} data-testid="mkr-input-error">
          {errorMaxMessage}
        </Text>
      )}
      {errorMin && (
        <Text sx={{ color: 'error', fontSize: 2 }} data-testid="mkr-input-error">
          Please enter a valid amount.
        </Text>
      )}
      {errorInvalidFormat && (
        <Text sx={{ color: 'error', fontSize: 2 }} data-testid="mkr-input-error">
          Please enter a valid number.
        </Text>
      )}
    </Box>
  );
}
