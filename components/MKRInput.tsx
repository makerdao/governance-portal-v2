import { useState } from 'react';
import { Input } from 'theme-ui';
import { MKR } from '../lib/maker';
import CurrencyObject from '../types/currency';

type Props = {
  placeholder: string;
  onChange: (value: CurrencyObject) => void;
  min?: CurrencyObject;
  max?: CurrencyObject;
};

const MKRInput = ({ placeholder = '0.00', ...props }: Props): JSX.Element => {
  const { onChange, min, max } = props;
  const [currentValueStr, setCurrentValueStr] = useState('');

  function updateValue(e: { currentTarget: { value: string } }) {
    const newValueStr = e.currentTarget.value;
    const newValue = MKR(newValueStr || '0');
    const invalidValue = (min && newValue.lt(min)) || (max && newValue.gt(max));
    if (invalidValue) {
      return;
    }

    onChange(newValue);
    setCurrentValueStr(newValueStr);
  }

  return (
    <Input
      aria-label="mkr-input"
      onChange={updateValue}
      type="number"
      value={currentValueStr}
      placeholder={placeholder}
    />
  );
};

export default MKRInput;
