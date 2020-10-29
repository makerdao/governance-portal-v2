import { render, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import theme from '../lib/theme';

export function renderWithTheme(component): RenderResult {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
}
