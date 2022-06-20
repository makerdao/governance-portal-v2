import { getPollTally } from '../getPollTally';
import { fetchRawPollTally } from '../../api/fetchRawPollTally';
import { fetchVotesByAddressForPoll } from '../../api/fetchVotesByAddress';
import { PluralityResult, Poll } from '../../types';
import BigNumber from 'bignumber.js';
import * as PRT from '../parseRawTally';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from 'modules/polling/polling.constants';

jest.mock('../../api/fetchRawPollTally');
jest.mock('../../api/fetchVotesByAddress');

const mockPoll: Poll = {
  tags: [
    {
      id: 'a',
      longname: 'a',
      shortname: 'a'
    }
  ],
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
  parameters: {
    inputFormat: PollInputFormat.singleChoice,
    resultDisplay: PollResultDisplay.singleVoteBreakdown,
    victoryConditions: [{ type: PollVictoryConditions.plurality }]
  },
  ctx: {} as any
};

const expectedPRTArg = {
  parameters: {
    inputFormat: PollInputFormat.singleChoice,
    resultDisplay: PollResultDisplay.singleVoteBreakdown,
    victoryConditions: [{ type: PollVictoryConditions.plurality }]
  },
  numVoters: 0,
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
  beforeAll(() => {
    (fetchRawPollTally as jest.Mock).mockReturnValue(
      Promise.resolve({
        totalMkrParticipation: new BigNumber(0),
        winner: '0',
        numVoters: 0,
        options: {}
      })
    );
    (fetchVotesByAddressForPoll as jest.Mock).mockReturnValue(Promise.resolve([]));
  });
  // We add this test to check that we always return a non-empty options object to the FE so the components that rely on populated data won't crash
  it('Returns a correct tally for plurality votes even when the options are empty', async () => {
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
  // Spy doesn't seem to work here

  // it('calls getPluralityResults for a plurality poll', async () => {
  //   jest.spyOn(PRT, 'getPluralityResults');

  //   PRT.parseRawPollTally(expectedPRTArg, mockPoll);

  //   expect(PRT.getPluralityResults).toHaveBeenCalled();
  // });

  it('calls getRankedChoiceResults for a instant-runoff poll', async () => {
    // TODO: It would be easier to just spy on the method for getting the results , but this doesn't seem to work
    // jest.spyOn(PRT, 'getRankedChoiceResults');

    const tally = await getPollTally(
      {
        ...mockPoll,
        pollId: 2,
        parameters: {
          inputFormat: PollInputFormat.rankFree,
          resultDisplay: PollResultDisplay.instantRunoffBreakdown,
          victoryConditions: [{ type: PollVictoryConditions.instantRunoff }]
        }
      },
      SupportedNetworks.GOERLIFORK
    );

    const results = tally.results;

    expect(results[0]).toEqual({
      optionId: '0',
      optionName: 'Abstain',
      firstChoice: 0,
      transfer: 0,
      firstPct: 0,
      transferPct: 0,
      eliminated: true,
      winner: false
    });
  });
});
