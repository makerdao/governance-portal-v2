import { useState } from 'react';
import { Input, Text, Box } from 'theme-ui';

import { MKR } from '../lib/maker';
import CurrencyObject from '../types/currency';

type Props = {
  placeholder?: string;
  onChange: (value: CurrencyObject) => void;
  min?: CurrencyObject;
  max?: CurrencyObject;
  error?: string | false;
};

const MKRInput = ({ placeholder = '0.00', error, ...props }: Props): JSX.Element => {
  const { onChange, min, max } = props;
  const [currentValueStr, setCurrentValueStr] = useState('');

  function updateValue(e: { currentTarget: { value: string } }) {
    const newValueStr = e.currentTarget.value;

    /* eslint-disable no-useless-escape */
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(newValueStr)) return; // only non-negative valid numbers
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
        aria-label="mkr-input"
        type="number"
        onChange={updateValue}
        value={currentValueStr}
        placeholder={placeholder}
      />
      {error && <Text sx={{ color: 'error', fontSize: 2 }}>{error}</Text>}
    </Box>
  );
};

export default MKRInput;
