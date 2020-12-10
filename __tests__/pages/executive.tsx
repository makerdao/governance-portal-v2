import ExecutiveOverviewPage from '../../pages/executive';
import proposals from '../../mocks/proposals.json';
import { renderWithTheme as render } from '../helpers';

test('basic rendering', async () => {
  const { getByText } = render(<ExecutiveOverviewPage proposals={proposals} />);
  getByText('Raise the Test Coverage');
});