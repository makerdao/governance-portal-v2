// @ts-nocheck
import { renderWithTheme as render } from '../helpers';

import Index from '../../pages/index';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { getPolls } from 'modules/polling/api/fetchPolls';
import blogPosts from '../__mocks__/blogPosts.json';

let proposals, polls;

beforeAll(async () => {
  jest.setTimeout(10000);
  [proposals, polls] = await Promise.all([getExecutiveProposals(), getPolls()]);
});

test('renders', async () => {
  const { debug } = render(<Index blogPosts={blogPosts} polls={polls.polls} proposals={proposals} />);
});
