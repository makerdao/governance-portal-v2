import { getPollTally } from '../getPollTally';
import { fetchPollTally } from '../../api/fetchPollTally';
import { fetchVotesByAddressForPoll } from '../../api/fetchVotesByAddress';
import { PluralityResult, Poll } from '../../types';
import BigNumber from 'bignumber.js';
import * as PRT from '../parseRawTally';
import { SupportedNetworks } from 'modules/web3/constants/networks';

jest.mock('../../api/fetchPollTally');
jest.mock('../../api/fetchVotesByAddress');

const mockPoll: Poll = {
  categories: ['a'],
  content: '',
  discussionLink: '',
  endDate: new Date(2011, 10, 30),
  multiHash: '',
  options: { '0': 'Abstain', '1': 'Yes', '2': 'No' },
  pollId: 1,
  startDate: new Date(2011, 10, 30),
  slug: '',
  summary: '',
  title: '2011,10,30',
  voteType: 'Plurality Voting',
  ctx: {} as any
};

const expectedPRTArg = {
  numVoters: 0,
  pollVoteType: 'Plurality Voting',
  totalMkrParticipation: new BigNumber(0),
  votesByAddress: [],
  winner: '0',
  options: {
    '0': {
      mkrSupport: new BigNumber(0),
      winner: false
    },
    '1': {
      mkrSupport: new BigNumber(0),
      winner: false
    },
    '2': {
      mkrSupport: new BigNumber(0),
      winner: false
    }
  }
};

describe('getPollTally', () => {
  // We add this test to check that we always return a non-empty options object to the FE so the components that rely on populated data won't crash
  it('Returns a correct tally for plurality votes even when the options are empty', async () => {
    (fetchPollTally as jest.Mock).mockReturnValue(
      Promise.resolve({
        totalMkrParticipation: new BigNumber(0),
        winner: '0',
        numVoters: 0,
        options: {}
      })
    );
    (fetchVotesByAddressForPoll as jest.Mock).mockReturnValue(Promise.resolve([]));
    jest.spyOn(PRT, 'parseRawPollTally');

    const poll = mockPoll;
    const tally = await getPollTally(poll, SupportedNetworks.GOERLIFORK);
    const results = tally.results as PluralityResult[];

    // When no options returned with tally, we manually add them in 'getPollTally'
    expect(PRT.parseRawPollTally).toHaveBeenCalledWith(expectedPRTArg, poll);

    // 'parseRawTally' returns the tally without the 'options' prop
    expect('options' in tally).toBe(false);

    // The tally results are created by looping over the poll options
    expect(results.length).toBe(Object.keys(poll.options).length);

    expect(results[0]).not.toBeUndefined();
    expect(results[0].mkrSupport.toString()).toEqual('0');
    expect(results[1]).not.toBeUndefined();
    expect(results[1].mkrSupport.toString()).toEqual('0');
    expect(results[2]).not.toBeUndefined();
    expect(results[2].mkrSupport.toString()).toEqual('0');
  });
});
