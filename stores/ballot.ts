import create from 'zustand';
import { devtools } from 'zustand/middleware';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';

const [useBallotStore] = create(
  devtools(
    (set, get) => ({
      ballot: {},
      addToBallot: (pollId, option: number | number[]) => {
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
      submitBallot: () => {
        set(state => {
          const newBallot = {};
          Object.keys(state.ballot).forEach(key => {
            if (!isNil(state.ballot[key].option))
              newBallot[key] = { ...state.ballot[key], submitted: state.ballot[key].option };
          });
          return { ballot: newBallot };
        }, 'submitBallot');
      }
    }),
    'BallotStore'
  )
);

export default useBallotStore;
