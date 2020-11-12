import WrappedAccountSelect from '../../components/header/AccountSelect';
import { renderWithTheme as render } from '../helpers'; 

test('rendering', () => {
  const { debug } = render(<WrappedAccountSelect />);
});