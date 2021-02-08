import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
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

async function createTestPolls() {
  // first poll is ranked choice, second is single select
  await maker.service('govPolling').createPoll(
    1577880000,
    33134788800,
    'test',
    'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP14%3A%20Inclusion%20Poll%20for%20Protocol%20DAI%20Transfer%20-%20June%208%2C%202020.md'
  );
  return maker.service('govPolling').createPoll(
    1577880000,
    33134788800,
    'test',
    'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP4c2-SP2%3A%20Inclusion%20Poll%20for%20MIP8%20Amendments%20-%20June%208%2C%202020.md'
  );
}

beforeAll(async () => {
  injectProvider();
  maker = await getMaker();
  await createTestPolls();
});

let component;
beforeEach(async() => {
  accountsApi.setState({ currentAccount: undefined });
  component = render(<PollingOverviewPage polls={mockPolls as any} />);
  await connectAccount(fireEvent.click, component);
});

// temporary hack to hide spam errors and warnings from dependencies
console.error = () => {};
console.warn = () => {};

// todo: split into appropriate test files for child components
describe('renders expected voting options for each poll type', () => {
  test('allows users to vote when account is connected', async () => {
    expect(await component.findByText('Active Polls')).toBeDefined();
    expect(await component.findByText('Your Ballot')).toBeDefined();
    // expect(await component.findAllByText('You have not voted')).toBeDefined();
    // expect((await component.findAllByText('View Details')).length).toBe(2);
    // expect((await component.findAllByText('Add vote to ballot')).length).toBe(2);
    // expect((await component.findAllByTestId('countdown timer')).length).toBe(2);
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
