import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
import PollingOverviewPage from '../../pages/polling';
import PollingReview from '../../pages/polling';
import getMaker from '../../lib/maker';
import mockPolls from '../../mocks/polls.json';
import useBreakpointIndex from '@theme-ui/match-media';
import { accountsApi } from '../../stores/accounts';

let maker;

jest.mock('@theme-ui/match-media', () => {
  return {
      useBreakpointIndex: jest.fn(() => 3)
  };
});

// Listbox opens on mousedown, not click event
function fireMouseClick(element: HTMLElement) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
}

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

let pollingOverview;
beforeEach(async() => {
  accountsApi.setState({ currentAccount: undefined });
  pollingOverview = render(<PollingOverviewPage polls={mockPolls as any} />);
  await connectAccount(fireEvent.click, pollingOverview);
});

describe('can vote in a poll', () => {
  // temporary hack to hide spam errors and warnings from dependencies
  console.error = () => {};
  console.warn = () => {};

  test('renders voting options when account is connected', async () => {
    expect(await pollingOverview.findAllByText('Active Polls')).toBeDefined();
    expect(await pollingOverview.findByText('Your Ballot')).toBeDefined();
  });

  describe('quick vote', () => {
    xtest('ranked choice', async () => {
      const polls = await pollingOverview.findAllByLabelText('Poll overview');
      const pollCard = polls[0];
      // expect(menu).toBeDefined();
      // fireEvent.change(menu, { target: { value: '0.25' }})
    });

    test.only('single select', async () => {
      const select = await pollingOverview.findByTestId('Single select');
      fireMouseClick(select);
      const option = await pollingOverview.findByText('Yes');
      fireEvent.mouseUp(option);
      fireEvent.click((await pollingOverview.findAllByText('Add vote to ballot'))[1]);
      fireEvent.click(await pollingOverview.findByText('Review & Submit Your Ballot'));
      // fireEvent.click(await pollingOverview.findByText('Submit Your Ballot'));
      pollingOverview.debug();
      expect(select).toBeDefined();
    });
  });
  
  xdescribe('ballot', () => {
    test('ranked choice', async () => {});
    test('single select', async () => {});
  });
});
