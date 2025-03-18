import { render, RenderResult } from '@testing-library/react';
import { ThemeUIProvider } from 'theme-ui';
import theme from 'lib/theme';
import React from 'react';

export function renderWithTheme(component: React.ReactNode): RenderResult {
  // @ts-expect-error - Incompatible pointer events
  return render(<ThemeUIProvider theme={theme}>{component}</ThemeUIProvider>);
}

export const mockIntersectionObserver = jest.fn(() => ({
  root: null,
  rootMargin: '600px',
  thresholds: [1],
  disconnect: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn(),
  takeRecords: jest.fn()
}));
