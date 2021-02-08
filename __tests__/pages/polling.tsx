import { injectProvider, connectAccount, createTestPolls, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
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
  await connectAccount(fireEvent.click, component);
});

describe('renders expected voting options for each poll type', () => {
  test('allows users to vote when account is connected', async () => {
    expect(await component.findByText('Active Polls')).toBeDefined();
    expect(await component.findByText('Your Ballot')).toBeDefined();
  });

  test('ranked choice options render properly', async () => {
    const select = await component.findByTestId('ranked choice');
    const options = await component.findAllByTestId('ranked choice option');

    expect(select).toBeDefined();
    expect(options.length).toBe(7);
    expect(await component.findByText('0')).toBeDefined();
    expect(await component.findByText('0.25')).toBeDefined();
    expect(await component.findByText('0.5')).toBeDefined();
    expect(await component.findByText('1')).toBeDefined();
    expect(await component.findByText('2')).toBeDefined();
    expect(await component.findByText('4')).toBeDefined();
  });

  test('single select options render properly', async () => {
    const select = await component.findByTestId('single select');
    const options = await component.findAllByTestId('single select option');

    expect(select).toBeDefined();
    expect(options.length).toBe(2);
    expect(await component.findByText('Yes')).toBeDefined();
    expect(await component.findByText('No')).toBeDefined();
  });
});
