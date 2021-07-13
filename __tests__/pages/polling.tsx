import { injectProvider, connectAccount, createTestPolls, renderWithAccountSelect as render } from '../helpers'; 
import PollingOverviewPage from '../../pages/polling';
import getMaker from '../../lib/maker';
import mockPolls from '../../mocks/polls.json';
import { accountsApi } from '../../stores/accounts';

let maker;

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

beforeAll(async () => {
  injectProvider();
  maker = await getMaker();
  await createTestPolls(maker);
});

let component;
beforeEach(async() => {
  accountsApi.setState({ currentAccount: undefined });
  component = render(<PollingOverviewPage polls={mockPolls as any} />);
  await connectAccount( component);
});

describe('renders expected voting options for each poll type', () => {
  test('allows users to vote when account is connected', async () => {
    expect(await component.findByText('Active Polls')).toBeDefined();
    expect(await component.findByText('Your Ballot')).toBeDefined();
  });
});
