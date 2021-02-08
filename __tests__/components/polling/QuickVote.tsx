import { fireEvent } from '@testing-library/react';
import mockPolls from '../../../mocks/polls.json';
import { accountsApi } from '../../../stores/accounts';
import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../../helpers'; 
import getMaker from '../../../lib/maker';
import PollingOverviewPage from '../../../pages/polling';

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

test('renders QuickVote component', async () => {
  expect(await component.findByText('Your Ballot')).toBeDefined();
  expect(await component.findAllByText('You have not voted')).toBeDefined();
  expect((await component.findAllByText('View Details')).length).toBe(2);
  expect((await component.findAllByText('Add vote to ballot')).length).toBe(2);
  expect((await component.findAllByTestId('countdown timer')).length).toBe(2);
});