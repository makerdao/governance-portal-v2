import { render, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from '../lib/maker/web3react';
import theme from '../lib/theme';

export function renderWithTheme(component): RenderResult {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
}

export function renderWithThemeAndAccount(component): RenderResult {
  return render(
    <Web3ReactProvider getLibrary={getLibrary}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Web3ReactProvider>
  );
}
