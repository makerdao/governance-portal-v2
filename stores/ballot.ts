import create from 'zustand';
import { devtools } from 'zustand/middleware';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import getMaker from '../lib/maker';
import { transactionsApi } from './transactions';
import Ballot from '../types/ballot';

type Store = {
  ballot: Ballot;
  ballotTxId: number;
  addToBallot: (pollId: number, option: number | number[]) => void;
  removeFromBallot: (pollId: number) => void;
  clearBallot: () => void;
  submitBallot: () => Promise<void>;
};

const [useBallotStore] = create<Store>(
  devtools(
    (set, get) => ({
      ballot: {},
      ballotTxId: 0,
      addToBallot: (pollId, option) => {
        set(
          state => ({ ballot: { ...state.ballot, [pollId]: { ...state.ballot[pollId], option } } }),
          'addToBallot'
        );
      },
      removeFromBallot: pollId => {
        set(state => {
          return omit(state.ballot, pollId);
        }, 'removeFromBallot');
      },
      clearBallot: () => {
        set({ ballot: {} }, 'clearBallot');
      },
      submitBallot: async () => {
        const newBallotObj = {};
        const maker = await getMaker();
        const pollIds: string[] = [];
        const pollOptions: string[] = [];
        const ballot = get().ballot;

        Object.keys(ballot).forEach((key: string) => {
          if (!isNil(ballot[key].option))
            newBallotObj[key] = { ...ballot[key], submitted: ballot[key].option };
          pollIds.push(key);
          pollOptions.push(ballot[key].option);
        });
        console.log(pollIds, pollOptions, 'poll ids poll options');
        const txObj = maker.service('govPolling').vote(pollIds, pollOptions);
        const ballotTxId = await transactionsApi.getState().track(txObj);

        console.log('bti', ballotTxId);
        set(() => {
          return { ballot: newBallotObj, ballotTxId };
        }, 'submitBallot');
      }
    }),
    'BallotStore'
  )
);

export default useBallotStore;
