import { getPollTally } from '../getPollTaly';
import { fetchPollTally } from '../../api/fetchPollTally';
import { fetchVotesByAddresForPoll } from '../../api/fetchVotesByAddress';
import { Poll } from '../../types';

jest.mock('../../api/fetchPollTally');
jest.mock('../../api/fetchVotesByAddresForPoll');

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
  it('Returns a correct tally even when the options are empty', async () => {
    (fetchPollTally as jest.Mock).mockReturnValue(
      Promise.resolve({
        pollVoteType: 'Plurality Voting',
        winner: '0',
        numVoters: 0,
        options: {}
      })
    );
    (fetchVotesByAddresForPoll as jest.Mock).mockReturnValue(Promise.resolve([]));

    const poll = mockPoll;
    const tally = await getPollTally(poll);

    expect(tally.options['0']).not.toBeUndefined();
    expect(tally.options['0'].mkrSupport).toEqual(0);
  });
});
