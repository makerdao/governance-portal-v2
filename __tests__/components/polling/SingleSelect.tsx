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

beforeAll(async () => {
  injectProvider();
  maker = await getMaker();
  await createTestPolls(maker);
});

let component;
beforeEach(async() => {
  accountsApi.setState({ currentAccount: undefined });
  component = render(<PollingOverviewPage polls={mockPolls as any} />);
  await connectAccount(component);
});

test('single select options render properly', async () => {
  const select = await component.findByTestId('single select');
  const options = await component.findAllByTestId('single select option');

  expect(select).toBeDefined();
  expect(options.length).toBe(2);
  expect(await component.findByText('Yes')).toBeDefined();
  expect(await component.findByText('No')).toBeDefined();
});