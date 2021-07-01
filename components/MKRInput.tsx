/** @jsx jsx */
import { useState, forwardRef } from 'react';
import { Input, Text, Box, jsx, ThemeUIStyleObject } from 'theme-ui';

import { MKR } from 'lib/maker';
import { CurrencyObject } from 'types/currency';

type Props = {
  placeholder?: string;
  onChange: (value: CurrencyObject) => void;
  min?: CurrencyObject;
  max?: CurrencyObject;
  error?: string | false;
  sx?: ThemeUIStyleObject;
};

const MKRInput = forwardRef<HTMLInputElement, Props>(
  ({ placeholder = '0.00', error, ...props }: Props, ref): JSX.Element => {
    const { onChange, min, max, sx } = props;
    const [currentValueStr, setCurrentValueStr] = useState('');

    function updateValue(e: { currentTarget: { value: string } }) {
      const newValueStr = e.currentTarget.value;

      /* eslint-disable no-useless-escape */
      if (!/^((0|[1-9]\d*)(\.\d+)?)?$/.test(newValueStr)) return; // only non-negative valid numbers
      const newValue = MKR(newValueStr || '0');
      const invalidValue = (min && newValue.lt(min)) || (max && newValue.gt(max));
      if (invalidValue) {
        return;
      }

      onChange(newValue);
      setCurrentValueStr(newValueStr);
    }

    return (
      <Box>
        <Input
          ref={ref}
          aria-label="mkr-input"
          type="number"
          onChange={updateValue}
          value={currentValueStr}
          placeholder={placeholder}
          sx={sx}
        />
        {error && <Text sx={{ color: 'error', fontSize: 2 }}>{error}</Text>}
      </Box>
    );
  }
);

export default MKRInput;
