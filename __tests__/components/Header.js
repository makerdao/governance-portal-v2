import Header from '../../components/Header';
import { renderWithTheme as render } from '../helpers'; 

test('rendering', () => {
  const { debug } = render(<Header />);
});