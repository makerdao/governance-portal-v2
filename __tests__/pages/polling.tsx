import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
import PollingOverviewPage from '../../pages/polling';
import getMaker from '../../lib/maker';
import mockPolls from '../../mocks/polls.json';
import useBreakpointIndex from '@theme-ui/match-media';

let maker;

jest.mock('@reach/listbox', () => {
  const listbox = jest.requireActual('@reach/listbox');
  return {
    ...listbox,
    ListboxInput: ({ children }) => children
  }
});

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

async function setup() {
  const component = render(<PollingOverviewPage polls={mockPolls as any} />);
  await connectAccount(fireEvent.click, component);
  // component.debug();
  const copyButton = await component.findByText('Copy Address');
  expect(copyButton).toBeDefined();
  return component;
}

beforeAll(async () => {
  injectProvider();
  maker = await getMaker();
  await createTestPolls();
});

describe('can vote in a poll', () => {
  // temporary hack to hide spam errors and warnings from dependencies
  console.error = () => {};
  console.warn = () => {};

  let component;
  beforeEach(async () => {
    component = await setup();
  })

  test('renders voting options when account is connected', async () => {
    // component.debug();
    expect(await component.findByText('Active Polls')).toBeDefined();
    expect(await component.findByText('Your Ballot')).toBeDefined();
  });

  xdescribe('quick vote', () => {
    test('ranked choice', async () => {
      const polls = await component.findAllByLabelText('Poll overview');
      const pollCard = polls[0];
      const menu = await component.findByTestId('Ranked choice select');
      component.debug(menu);
      expect(menu).toBeDefined();
      fireEvent.change(menu, { target: { value: '0.25' }})
      // component.debug(pollCard);
    });

    test('single select', async () => {
      const select = await component.findByLabelText('Single select');
      expect(select).toBeDefined();
    });
  });
  
  xdescribe('ballot', () => {
    test('ranked choice', async () => {});
    test('single select', async () => {});
  });
});
