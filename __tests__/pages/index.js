import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';

import theme from '../../lib/theme';
import Index from '../../pages/index';
import { getPostsAndPhotos, getExecutiveProposals, getPolls } from '../../lib/api';

let blogPosts, proposals, polls;

beforeAll(async () => {
  [blogPosts, proposals, polls] = await Promise.all([
    getPostsAndPhotos(),
    getExecutiveProposals(),
    getPolls()
  ]);
});

test('renders', async () => {
  const { debug } = render(
    <ThemeProvider theme={theme}>
      <Index blogPosts={blogPosts} polls={polls} proposals={proposals} />
    </ThemeProvider>
  );
});
