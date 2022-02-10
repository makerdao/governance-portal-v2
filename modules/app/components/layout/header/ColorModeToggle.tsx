import React from 'react';
import { useColorMode, IconButton } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

const ColorModeToggle = (): React.ReactElement => {
  const [mode, setMode] = useColorMode();

  const onToggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    const html = document.getElementsByTagName('html');
    if (html) html[0].style.colorScheme = next;
    setMode(next);
  };

  return (
    <IconButton aria-label="Dark mode toggle" onClick={() => onToggleTheme()}>
      <Icon name="darkMode" color="text" size="30px" />
    </IconButton>
  );
};

export default ColorModeToggle;
