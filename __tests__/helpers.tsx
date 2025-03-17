import { render, RenderResult } from '@testing-library/react';
import { ThemeUIProvider } from 'theme-ui';
import theme from 'lib/theme';
import React from 'react';
import { vi } from 'vitest';

export function renderWithTheme(component: React.ReactNode): RenderResult {
  // @ts-expect-error - Incompatible pointer events
  return render(<ThemeUIProvider theme={theme}>{component}</ThemeUIProvider>);
}

export const mockIntersectionObserver = vi.fn(() => ({
  root: null,
  rootMargin: '600px',
  thresholds: [1],
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  takeRecords: vi.fn()
}));
