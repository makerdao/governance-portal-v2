import { getPollTally } from '../getPollTaly';
import { fetchPollTally } from '../../api/fetchPollTally';
import { fetchVotesByAddresForPoll } from '../../api/fetchVotesByAddress';
import { Poll } from '../../types';
import BigNumber from 'bignumber.js';

jest.mock('../../api/fetchPollTally');
jest.mock('../../api/fetchVotesByAddress');

const mockPoll: Poll = {
  categories: ['a'],
  content: '',
  discussionLink: '',
  endDate: new Date(2011, 10, 30),
  multiHash: '',
  options: {},
  pollId: 1,
  startDate: new Date(2011, 10, 30),
  slug: '',
  summary: '',
  title: '2011,10,30',
  voteType: 'Plurality Voting',
  ctx: {} as any
};

describe('getPollTally', () => {
  // 29-11-2021, the gov portal crashed due to a empty options object being returned to the UI and not handled
  // correctly. We add this test to check that we always return a non-empty options object to the FE
  it('Returns a correct tally even when the options are empty', async () => {
    (fetchPollTally as jest.Mock).mockReturnValue(
      Promise.resolve({
        totalMkrParticipation: new BigNumber(0),
        winner: '0',
        numVoters: 0,
        options: {}
      })
    );
    (fetchVotesByAddresForPoll as jest.Mock).mockReturnValue(Promise.resolve([]));

    const poll = mockPoll;
    const tally = await getPollTally(poll);
    expect(tally.options['0']).not.toBeUndefined();
    expect(tally.options['0'].mkrSupport.toString()).toEqual('0');
    expect(tally.options['1']).not.toBeUndefined();
    expect(tally.options['1'].mkrSupport.toString()).toEqual('0');
    expect(tally.options['2']).not.toBeUndefined();
    expect(tally.options['2'].mkrSupport.toString()).toEqual('0');
  });
});
