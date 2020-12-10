import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
import PollingOverviewPage from '../../pages/polling';
import getMaker from '../../lib/maker';
import mockPolls from '../../mocks/polls.json';

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

async function setup() {
  const {
    debug,
    findByText,
    findByLabelText,
    findAllByText
  } = render(<PollingOverviewPage polls={mockPolls as any} />);
  await connectAccount(click, findByText, findByLabelText);

  return {
    debug,
    findByText,
    findByLabelText,
    findAllByText
  }
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
  });

  test('renders voting options when account is connected', async () => {
    expect(await component.findByText('Active Polls')).toBeDefined();
    expect(await component.findByText('Your Ballot')).toBeDefined();
    // component.debug();
  });

  describe('quick vote', () => {
    test('irv', async () => {
      expect(await component.findAllByText('View Details')).toBeDefined();
      // component.debug();
    });
    test('plurality', async () => {});
  });
  
  describe('add to ballot and submit', () => {
    test('irv', async () => {});
    test('plurality', async () => {});
  });
});

describe('can edit selected choices', () => {
  describe('quick vote', () => {
    test('irv', async () => {});
    test('plurality', async () => {});
  });
  
  describe('ballot', () => {
    test('irv', async () => {});
    test('plurality', async () => {});
  })
});
