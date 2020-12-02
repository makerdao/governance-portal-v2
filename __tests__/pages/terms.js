import React from 'react';
import { renderWithTheme as render } from '../helpers';

import Terms from '../../pages/terms';


test('renders', async () => {
  const { debug } = render(
    <Terms />
  );
});
