import BigNumber from 'bignumber.js';
import {
  PollInputFormat,
  PollResultDisplay,
  PollVictoryConditions,
  POLL_VOTE_TYPE
} from '../../polling.constants';
import { Poll, RawPollTally } from '../../types';
import { parseRawPollTally } from '../parseRawTally';

describe('Parse raw tally', () => {
  it('Parses a plurality tally', () => {
    const parsedTally: RawPollTally = {
      winner: '2',
      totalMkrParticipation: new BigNumber('39291.015916857528910257'),
      numVoters: 5,
      options: {
        '1': {
          mkrSupport: new BigNumber('59.445594300396631157'),
          winner: false
        },
        '2': {
          mkrSupport: new BigNumber('39231.5703225571322791'),
          winner: true
        }
      }
    };
    const poll = {
      options: {
        '0': 'Abstain',
        '1': 'Yes (Greenlight)',
        '2': 'No (Defer)'
      },
      parameters: {
        inputFormat: PollInputFormat.singleChoice,
        resultDisplay: PollResultDisplay.singleVoteBreakdown,
        victoryConditions: [{ type: PollVictoryConditions.plurality }]
      }
    } as any as Poll;

    const result = parseRawPollTally(parsedTally, poll);

    expect(result.totalMkrParticipation).toEqual(39291.01591685753);
    expect(result.winner).toEqual('2');
    expect(result.numVoters).toEqual(5);
    expect(result.winningOptionName).toEqual('No (Defer)');
    expect(result.results).toEqual([
      {
        optionId: '2',
        optionName: 'No (Defer)',
        mkrSupport: 39231.5703225571322791,
        firstPct: 99.848704359219961211,
        winner: true
      },
      {
        optionId: '1',
        optionName: 'Yes (Greenlight)',
        mkrSupport: 59.445594300396631157,
        firstPct: 0.151295640780038789,
        winner: false
      },
      { optionId: '0', optionName: 'Abstain', mkrSupport: 0, firstPct: 0, winner: false }
    ]);
  });

  it('Parses a Ranked Choice tally', () => {
    const poll = {
      options: {
        '0': 'Abstain',
        '1': 'Increase to 90 million by 0.67 million per week',
        '2': 'Increase to 130 million by 0.67 million per week',
        '3': 'Increase to 90 million by 1 million per week',
        '4': 'Increase to 130 million by 1 million per week',
        '5': 'No change'
      },
      parameters: {
        inputFormat: PollInputFormat.rankFree,
        resultDisplay: PollResultDisplay.instantRunoffBreakdown,
        victoryConditions: [{ type: PollVictoryConditions.instantRunoff }]
      }
    } as any as Poll;

    const tally: RawPollTally = {
      rounds: 4,
      winner: '3',
      totalMkrParticipation: new BigNumber('75560.285447124316570144'),
      options: {
        '1': {
          firstChoice: new BigNumber('34920.806575167757456928'),
          transfer: new BigNumber('84.627193150352315831'),
          winner: false,
          eliminated: false
        },
        '2': {
          firstChoice: new BigNumber('92.326977163997066566'),
          transfer: new BigNumber('-50.370419650904389957'),
          winner: false,
          eliminated: true
        },
        '3': {
          firstChoice: new BigNumber('30385.874558764720704793'),
          transfer: new BigNumber('10127.020562528393415983'),
          winner: true,
          eliminated: false
        },
        '4': {
          firstChoice: new BigNumber('10127.020562528393415983'),
          transfer: new BigNumber('-10127.020562528393415983'),
          winner: false,
          eliminated: true
        },
        '5': {
          firstChoice: new BigNumber('34.256773499447925874'),
          transfer: new BigNumber('-34.256773499447925874'),
          winner: false,
          eliminated: true
        }
      },
      numVoters: 12
    };

    const result = parseRawPollTally(tally, poll);
    expect(result.winner).toEqual('3');
    expect(result.totalMkrParticipation).toEqual(75560.28544712432);
    expect(result.numVoters).toEqual(12);

    expect(result.results).toEqual([
      {
        optionId: '3',
        optionName: 'Increase to 90 million by 1 million per week',
        firstChoice: 30385.874558764720704793,
        transfer: 10127.020562528393415983,
        firstPct: 40.214081218669020228,
        transferPct: 13.402570546951009323,
        eliminated: false,
        winner: true
      },
      {
        optionId: '1',
        optionName: 'Increase to 90 million by 0.67 million per week',
        firstChoice: 34920.806575167757456928,
        transfer: 84.627193150352315831,
        firstPct: 46.215821404757250259,
        transferPct: 0.111999567827960169,
        eliminated: false,
        winner: false
      },
      {
        optionId: '2',
        optionName: 'Increase to 130 million by 0.67 million per week',
        firstChoice: 92.326977163997066566,
        transfer: -50.370419650904389957,
        firstPct: 0.122189820509089751,
        transferPct: -0.06666255871432973,
        eliminated: true,
        winner: false
      },
      {
        optionId: '0',
        optionName: 'Abstain',
        firstChoice: 0,
        transfer: 0,
        firstPct: 0,
        transferPct: 0,
        eliminated: true,
        winner: false
      },
      {
        optionId: '4',
        optionName: 'Increase to 130 million by 1 million per week',
        firstChoice: 10127.020562528393415983,
        transfer: -10127.020562528393415983,
        firstPct: 13.402570546951009323,
        transferPct: -13.402570546951009323,
        eliminated: true,
        winner: false
      },
      {
        optionId: '5',
        optionName: 'No change',
        firstChoice: 34.256773499447925874,
        transfer: -34.256773499447925874,
        firstPct: 0.045337009113630439,
        transferPct: -0.045337009113630439,
        eliminated: true,
        winner: false
      }
    ]);
  });
});
