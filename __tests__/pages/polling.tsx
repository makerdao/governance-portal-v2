import { injectProvider, renderWithAccountSelect as render } from '../helpers'; 
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
  beforeEach(async () => {
    await createTestPoll();
  });

  test('quick vote', async () => {
    const { debug, findByText } = render(<PollingOverviewPage polls={[]} />);
    expect(await findByText('Active Polls')).toBeDefined();

    click(await findByText('Connect wallet'));
    click(await findByText('MetaMask'));
    // debug();
  });
});