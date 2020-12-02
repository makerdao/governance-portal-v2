import React from 'react';
import { renderWithTheme as render } from '../helpers';

import Executive from '../../pages/executive';
import { getExecutiveProposals } from '../../lib/api';

let proposals;

beforeAll(async () => {
  [proposals] = await Promise.all([
    getExecutiveProposals()
  ]);
});

test('renders', async () => {
  const { debug } = render(
    <Executive proposals={proposals} />
  );
});
