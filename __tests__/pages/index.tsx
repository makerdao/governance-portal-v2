import React from 'react';
import { renderWithTheme as render } from '../helpers';

import Index from '../../pages/index';
import { getExecutiveProposals } from 'modules/executives/api/fetchExecutives';
import { getPolls } from 'modules/polls/api/fetchPolls';
import blogPosts from '../__mocks__/blogPosts.json';

let proposals, polls;

beforeAll(async () => {
  jest.setTimeout(10000);
  [proposals, polls] = await Promise.all([
    getExecutiveProposals(),
    getPolls()
  ]);
});

test('renders', async () => {

  const { debug } = render(
    <Index blogPosts={blogPosts} polls={polls} proposals={proposals} />
  );
});
