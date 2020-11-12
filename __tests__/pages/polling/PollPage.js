import { renderWithConnectedAccount as render } from '../../helpers'; 
import PollPage from '../../../pages/polling/[poll-hash]';

test('rendering', () => {
  const { debug } = render(<PollPage />);
  console.log(debug());
});