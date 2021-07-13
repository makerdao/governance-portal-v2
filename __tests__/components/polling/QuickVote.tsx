import mockPolls from '../../../mocks/polls.json';
import { accountsApi } from '../../../stores/accounts';
import { injectProvider, connectAccount, createTestPolls, renderWithAccountSelect as render } from '../../helpers'; 
import getMaker from '../../../lib/maker';
import PollingOverviewPage from '../../../pages/polling';

let maker;

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

describe('QuickVote', () => {
    
  beforeAll(async () => {
    injectProvider();
    maker = await getMaker();
    accountsApi.getState().addAccountsListener();
    await createTestPolls(maker);
    jest.setTimeout(30000);
  });

  let component;
  beforeEach(async() => {
    accountsApi.setState({ currentAccount: undefined });
    component = render(<PollingOverviewPage polls={mockPolls as any} />);
    await connectAccount(component);
  });

  test('renders QuickVote component', async () => {
    expect(await component.findByText('Your Ballot')).toBeDefined();
    expect(await component.findAllByText('You have not voted')).toBeDefined();
    expect((await component.findAllByText('View Details')).length).toBe(2);
    expect((await component.findAllByText('Add vote to ballot')).length).toBe(2);
    expect((await component.findAllByTestId('countdown timer')).length).toBe(2);
  });
});