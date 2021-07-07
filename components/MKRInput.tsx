/** @jsx jsx */
import { useState } from 'react';
import { Input, Text, Button, Box, Flex, jsx, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';

type Props = {
  placeholder?: string;
  onChange: (value: BigNumber) => void;
  min?: BigNumber;
  max?: BigNumber;
  balance?: BigNumber;
  balanceText?: string;
  errorMessage?: string;
  value: BigNumber;
};

export function MKRInput({
  placeholder = '0.00 MKR',
  errorMessage = 'MKR balance too low',
  onChange,
  min = new BigNumber(0),
  max,
  balance,
  balanceText = 'MKR Balance:',
  value
}: Props): React.ReactElement {
  const [currentValueStr, setCurrentValueStr] = useState('');

  function updateValue(e: { currentTarget: { value: string } }) {
    const newValueStr = e.currentTarget.value;
    console.log('EA', newValueStr);
    const newValue = new BigNumber(newValueStr || '0');

    const invalidValue = newValue.lt(min) || (max && newValue.gt(max));
    if (invalidValue || newValue.isNaN()) {
      console.log('is invalid', min, max, newValue.toString());
      return;
    }

    console.log('ONCHAGE', newValueStr, newValue.toString());

    onChange(newValue);
    setCurrentValueStr(newValueStr);
  }

  const disabledButton = balance === undefined;

  const onClickSetMax = () => {
    onChange(balance ? balance : new BigNumber(0));
  };

  const error = value !== undefined && value.isGreaterThan(balance || new BigNumber(0));

  useEffect(() => {
    console.log(value);
    setCurrentValueStr(value.toString());
  }, [value]);

  return (
    <Box>
      <Flex sx={{ border: '1px solid #D8E0E3', justifyContent: 'space-between' }}>
        <Input
          aria-label="mkr-input"
          type="number"
          onChange={updateValue}
          value={currentValueStr}
          placeholder={placeholder}
          lang="en" // Forces dot for decimals
          sx={{
            border: 'none'
          }}
        />
        <Button
          disabled={disabledButton}
          variant="textual"
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
        >
          {balanceText}&nbsp;
        </Text>

        {balance ? (
          <Text sx={{ cursor: 'pointer', fontSize: 2, mt: 2 }} onClick={onClickSetMax}>
            {balance.toFormat(6)}
          </Text>
        ) : (
          <Box sx={{ width: 6 }}>
            <Skeleton />
          </Box>
        )}
      </Flex>

      {error && <Text sx={{ color: 'error', fontSize: 2 }}>{errorMessage}</Text>}
    </Box>
  );
}
