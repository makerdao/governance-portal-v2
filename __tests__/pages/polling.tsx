import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
import PollingOverviewPage from '../../pages/polling';
import getMaker from '../../lib/maker';

const { click } = fireEvent;
let maker;

function createTestPoll() {
  return maker.service('govPolling').createPoll(
    1577880000,
    33134788800,
    'test',
    'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP14%3A%20Inclusion%20Poll%20for%20Protocol%20DAI%20Transfer%20-%20June%208%2C%202020.md'
  );
}

beforeAll(async () => {
  injectProvider();
  maker = await getMaker();
});

describe('can vote in a poll', () => {
  let log, find;

  beforeEach(async () => {
    await createTestPoll();
    const { debug, findByText } = render(<PollingOverviewPage polls={[]} />);
    log = debug;
    find = findByText;
    await connectAccount(click, find);
  });

  test('renders voting options when account is connected', async () => {
    expect(await find('Active Polls')).toBeDefined();
    expect(await find('Your Ballot: 0 votes')).toBeDefined();
  });

  test('quick vote', async () => {
    log();
  });
});
