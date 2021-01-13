import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
import PollingOverviewPage from '../../pages/polling';
import getMaker from '../../lib/maker';
import mockPolls from '../../mocks/polls.json';

const { click, keyDown, change } = fireEvent;
let maker;

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
  const {
    debug,
    findByText,
    findByLabelText,
    findAllByLabelText,
    findAllByText,
    getByTestId
  } = render(<PollingOverviewPage polls={mockPolls as any} />);
  await connectAccount(click, findByText, findByLabelText);

  return {
    debug,
    findByText,
    findByLabelText,
    findAllByLabelText,
    findAllByText,
    getByTestId,
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

  test.only('renders voting options when account is connected', async () => {
    expect(await component.findByText('Active Polls')).toBeDefined();
    expect(await component.findByText('Your Ballot')).toBeDefined();
  });

  describe('quick vote', () => {
    test('ranked choice', async () => {
      const polls = await component.findAllByLabelText('Poll overview');
      const pollCard = polls[0];
      const menu = (await component.findAllByText('1st choice'))[0];
      expect(menu).toBeDefined();
      const option = await component.findByText('0.25');
      // change(menu, {target: { value: '0.25'}});
      keyDown(menu);
      component.debug(menu);
      // component.debug(pollCard);
      component.debug(pollCard);
      const options = await component.findAllByLabelText('ranked choice option');
      // component.debug(options[0]);
    });

    test('single select', async () => {
      const select = await component.findByLabelText('Single select');
      expect(select).toBeDefined();
    });
  });
  
  describe('ballot', () => {
    test('ranked choice', async () => {});
    test('single select', async () => {});
  });

  describe('mobile', () => {
    test('ranked choice', async () => {});
    test('single select', async () => {});
  });
});

describe('can edit selected choices', () => {
  describe('quick vote', () => {
    test('ranked choice', async () => {});
    test('single select', async () => {});
  });
  
  describe('ballot', () => {
    test('ranked choice', async () => {});
    test('single select', async () => {});
  });

    describe('mobile', () => {
    test('ranked choice', async () => {});
    test('single select', async () => {});
  });
});
