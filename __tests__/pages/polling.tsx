import { injectProvider, renderWithTheme as render } from '../helpers'; 
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
    'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Proposal%20-%20Add%20renBTC%20as%20a%20Collateral%20Type%20-%20November%2030%2C%202020.md'
  );
}

beforeAll(async () => {
  injectProvider();
  maker = await getMaker();
});

describe('can vote in a poll', () => {
  test ('quick vote', async () => {
    const pollId = await createTestPoll();
    const polls = [];
    const { debug } = render(<PollingOverviewPage polls={polls} />);
    debug();
  });
});