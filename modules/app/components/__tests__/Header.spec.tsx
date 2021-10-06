import { screen } from '@testing-library/react';
import Header from '../layout/Header';
import { renderWithTheme as render } from '../../../../__tests__/helpers';

test('rendering', async () => {
  const view = render(<Header />);
  const [makerIcon, menuIcon] = await screen.findAllByRole('presentation');
});
