import React from 'react';
import { useColorMode, IconButton } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

const ColorModeToggle = (): React.ReactElement => {
  const [mode, setMode] = useColorMode();
  return (
    <IconButton
      aria-label="Dark mode toggle"
      onClick={() => {
        const next = mode === 'dark' ? 'light' : 'dark';
        setMode(next);
      }}
    >
      <Icon name="darkMode" color="text" size="30px" />
    </IconButton>
  );
};

export default ColorModeToggle;
