import { useState } from 'react';
import { Input } from '@theme-ui/components';
import { MKR } from '../lib/maker';
import CurrencyObject from '../types/currency';

type Props = {
  placeholder: string;
  onChange: (value: CurrencyObject) => void;
  min?: CurrencyObject;
  max?: CurrencyObject;
};

const MKRInput: React.FC<Props> = ({ placeholder = '0.00', ...props }) => {
  const { onChange, min, max } = props;
  const [currentValueStr, setCurrentValueStr] = useState('');

  function updateValue(e) {
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
