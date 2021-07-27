import React from 'react';
import { Flex, useColorMode } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

const ColorModeToggle = (): React.ReactElement => {
  const [mode, setMode] = useColorMode();
  return (
    <Flex
      sx={{ cursor: 'pointer' }}
      onClick={() => {
        const next = mode === 'dark' ? 'light' : 'dark';
        setMode(next);
      }}
    >
      <Icon name="moon" sx={{ height: 20, width: 20 }} />
    </Flex>
  );
};

export default ColorModeToggle;
