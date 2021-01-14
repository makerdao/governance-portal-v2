import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
import PollingOverviewPage from '../../pages/polling';
import getMaker from '../../lib/maker';
import mockPolls from '../../mocks/polls.json';
import useBreakpointIndex from '@theme-ui/match-media';

const { click } = fireEvent;
let maker;

async function createTestPolls() {
  // first poll is ranked choice, second is plurality
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

// Sets the bpi. Can be moved within tests to switch
// between desktop and mobile
jest.mock('@theme-ui/match-media', () => {
  return {
      useBreakpointIndex: jest.fn(() => 3)
  };
});

beforeAll(async () => {
  injectProvider();
  maker = await getMaker();
  await createTestPolls();
});

describe('can vote in a poll', () => {
  // temporary hack to hide spam errors and warnings from dependencies
  console.error = () => {};
  console.warn = () => {};

  test('renders voting options when account is connected', async () => {
    const {
      findByText,
      findByLabelText
    } = render(<PollingOverviewPage polls={mockPolls as any} />);
    await connectAccount(click, findByText, findByLabelText);
  
    expect(await findByText('Active Polls')).toBeDefined();
    expect(await findByText('Your Ballot')).toBeDefined();
  });

  describe('quick vote', () => {
    test('ranked choice', async () => {
      // this test is incomplete
      const { findAllByText } = render(<PollingOverviewPage polls={mockPolls as any} />);
      expect(await findAllByText('View Details')).toBeDefined();
    });
  });
});
