import React from 'react';
import { renderWithTheme } from '../helpers';
import PollCreate from '../../../pages/polling/create';

describe('polling create render', () => {
  test('renders', async () => {
    const { debug } = renderWithTheme(<PollCreate />);
  });
})