import { forwardRef } from 'react';
import { Button, Box, Flex, Text } from '@theme-ui/components';
import {MKRInput} from 'components/MKRInput';
import BigNumber from 'bignumber.js';
import { useState } from 'react';

type Props = {
  title: string;
  description: string;
  onChange: any;
  balance?: BigNumber;
  buttonLabel: string;
  onClick: () => void;
};

export function InputDelegateMkr({
  title,
  description,
  onChange,
  balance,
  buttonLabel,
  onClick
}: Props): React.ReactElement {

  const [value, setValue] = useState(new BigNumber(0))

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
        <MKRInput
            value={value}
            onChange={handleChange}
            balance={balance}
          />
        <Button onClick={onClick} sx={{ width: '100%', mt: 3 }}>
          {buttonLabel}
        </Button>
      </Box>
    </Flex>
  )
}

