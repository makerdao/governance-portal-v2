import { screen } from '@testing-library/react';
import Header from '../../components/Header';
import { renderWithTheme as render } from '../helpers';

test('rendering', async () => {
  const view = render(<Header />);
  const [makerIcon, menuIcon] = await screen.findAllByRole('presentation');
});
