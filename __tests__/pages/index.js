import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';

import theme from '../../lib/theme';
import Index from '../../pages/index';

test('renders', async () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <Index />
    </ThemeProvider>
  );
});
