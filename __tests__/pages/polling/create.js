import React from 'react';
import { renderWithTheme } from '../../helpers';
import PollCreate from '../../../pages/polling/create';
import getMaker from '../../../lib/maker';
import { injectProvider } from '../../helpers'; 

beforeAll(async () => {
    injectProvider();
    maker = await getMaker();
    // await createTestPolls();
  });

  
describe('polling create render', () => {
  test('renders', async () => {
    const { debug } = renderWithTheme(<PollCreate />);
  });
})