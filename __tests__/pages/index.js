import React from 'react';
import { renderWithTheme as render } from '../helpers';

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
    <Index blogPosts={blogPosts} polls={polls} proposals={proposals} />
  );
});
