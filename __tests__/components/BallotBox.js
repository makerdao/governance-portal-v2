import BallotBox from '../../components/polling/BallotBox';
import { renderWithThemeAndAccount as render } from '../helpers'; 

test('rendering', () => {
  const { debug } = render(<BallotBox ballot={{}} activePolls={[]} network='who knows' polls={[]} />);
  console.log(debug());
});