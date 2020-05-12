import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';

import theme from '../../lib/theme';
import Index from '../../pages/index';

test('renders header', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <Index />
    </ThemeProvider>
  );
  const heading = getByText(/Maker Governance/);
  expect(heading).toBeInTheDocument();
});
