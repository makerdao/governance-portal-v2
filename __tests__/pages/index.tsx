import React from 'react';
import { renderWithTheme as render } from '../helpers';

import Index from '../../pages/index';
import { getExecutiveProposals } from 'modules/executives/api/fetchExecutives';
import { getPolls } from 'modules/polls/api/fetchPolls';
import { fetchBlogPosts } from 'modules/blog/api/fetchBlogPosts';

let blogPosts, proposals, polls;

beforeAll(async () => {
  jest.setTimeout(10000);
  [blogPosts, proposals, polls] = await Promise.all([
    fetchBlogPosts(),
    getExecutiveProposals(),
    getPolls()
  ]);
});

test('renders', async () => {
  const { debug } = render(
    <Index blogPosts={blogPosts} polls={polls} proposals={proposals} />
  );
});
