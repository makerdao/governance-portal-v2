import React from 'react';
import { renderWithTheme as render } from '../helpers';

import Polling from '../../pages/polling';
import { getPolls } from '../../lib/api';

let  polls;

beforeAll(async () => {
  [polls] = await Promise.all([
    getPolls()
  ]);
});

test('renders', async () => {
  const { debug } = render(
    <Polling polls={polls} />
  );
});
