import create from 'zustand';

const [useBallotStore] = create(set => ({
  ballot: {},
  addToBallot: (pollId, option) => {
    set(state => ({ ballot: {...state.ballot, [pollId]: { ...state.ballot[pollId], option }} }));
  },
  clearBallot: () => {
    set({ ballot: {} });
  },
  submitBallot: () => {
    set(state => {
        let newBallotObj = {};
        Object.keys(state.ballot).forEach(key => {
            if (state.ballot[key].option) newBallotObj[key] = {...state.ballot[key], submitted: state.ballot[key].option }
        });
        return {ballot: newBallotObj};
    });
  }
}));

export default useBallotStore;