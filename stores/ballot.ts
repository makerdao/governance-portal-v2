import create from 'zustand';
import { devtools } from 'zustand/middleware';

const [useBallotStore] = create(devtools((set, get) => ({
  ballot: {},
  addToBallot: (pollId, option: number | number[]) => {
    set(state => ({ ballot: { ...state.ballot, [pollId]: { ...state.ballot[pollId], option } } }), 'addToBallot');
  },
  removeFromBallot: (pollId, option) => {
    set(state => {
      const { pollId, ...updatedBallot } = state.ballot;
      return updatedBallot;
    }, 'removeFromBallot');
  },
  clearBallot: () => {
    set({ ballot: {} }, 'clearBallot');
  },
  submitBallot: () => {
    set(state => {
      let newBallotObj = {};
      Object.keys(state.ballot).forEach(key => {
        if (state.ballot[key].option)
          newBallotObj[key] = { ...state.ballot[key], submitted: state.ballot[key].option };
      });
      return { ballot: newBallotObj };
    }, 'submitBallot');
  }
}), 'BallotStore'));

export default useBallotStore;
