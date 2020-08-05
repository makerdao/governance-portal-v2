import create from 'zustand';
import { devtools } from 'zustand/middleware';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import getMaker from '../lib/maker';
import { transactionsApi } from './transactions';
import Ballot from '../types/ballot';

type Store = {
  ballot: Ballot;
  txId: null | string;
  clearTx: () => void;
  addToBallot: (pollId: number, option: number | number[]) => void;
  removeFromBallot: (pollId: number) => void;
  clearBallot: () => void;
  submitBallot: () => Promise<string>;
};

const [useBallotStore] = create<Store>(
  devtools(
    (set, get) => ({
      ballot: {},
      txId: null,

      clearTx: () => {
        set({ txId: null });
      },

      addToBallot: (pollId, option: number | number[]) => {
        set(
          state => ({ ballot: { ...state.ballot, [pollId]: { ...state.ballot[pollId], option } } }),
          'addToBallot'
        );
      },

      removeFromBallot: pollId => {
        set(state => omit(state.ballot, pollId), 'removeFromBallot');
      },

      clearBallot: () => {
        set({ ballot: {} }, 'clearBallot');
      },

      submitBallot: async () => {
        const newBallot = {};
        const maker = await getMaker();
        const ballot = get().ballot;

        const pollIds: string[] = [];
        const pollOptions: string[] = [];
        Object.keys(ballot).forEach((key: string) => {
          if (!isNil(ballot[key].option)) {
            newBallot[key] = { ...ballot[key], submittedBallot: ballot[key].option };
            pollIds.push(key);
            pollOptions.push(ballot[key].option);
          }
        });

        const voteTxCreator = () => maker.service('govPolling').vote(pollIds, pollOptions);
        const txId = await transactionsApi.getState().track(voteTxCreator);

        set({ ballot: newBallot, txId }, 'submitBallot');
      }
    }),
    'BallotStore'
  )
);

export default useBallotStore;
