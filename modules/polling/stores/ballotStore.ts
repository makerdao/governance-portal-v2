import create from 'zustand';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import getMaker from 'lib/maker';
import { Ballot } from '../types/ballot';
import { transactionsApi } from 'modules/app/stores/transactions';
import { accountsApi } from 'modules/app/stores/accounts';

type Store = {
  ballot: Ballot;
  txId: null | string;
  clearTx: () => void;
  addToBallot: (pollId: number, option: number | number[]) => void;
  removeFromBallot: (pollId: number) => void;
  clearBallot: () => void;
  submitBallot: () => Promise<void>;
};

const [useBallotStore] = create<Store>((set, get) => ({
  ballot: {},
  txId: null,

  clearTx: () => {
    set({ txId: null });
  },

  addToBallot: (pollId, option: number | number[]) => {
    set(state => ({ ballot: { ...state.ballot, [pollId]: { ...state.ballot[pollId], option } } }));
  },

  removeFromBallot: pollId => {
    set(state => ({ ballot: omit(state.ballot, pollId) }));
  },

  clearBallot: () => {
    set({ ballot: {} });
  },

  submitBallot: async () => {
    const newBallot = {};
    const maker = await getMaker();
    const ballot = get().ballot;

    const pollIds: string[] = [];
    const pollOptions: string[] = [];

    Object.keys(ballot).forEach((key: string) => {
      if (!isNil(ballot[key].option)) {
        newBallot[key] = { ...ballot[key], submittedOption: ballot[key].option };
        pollIds.push(key);
        pollOptions.push(ballot[key].option);
      }
    });

    const voteDelegate = accountsApi.getState().voteDelegate;

    const voteTxCreator = voteDelegate
      ? () => voteDelegate.votePoll(pollIds, pollOptions)
      : () => maker.service('govPolling').vote(pollIds, pollOptions);
    const txId = await transactionsApi
      .getState()
      .track(voteTxCreator, `Voting on ${Object.keys(ballot).length} polls`, {
        mined: txId => {
          get().clearBallot();
          transactionsApi.getState().setMessage(txId, `Voted on ${Object.keys(ballot).length} polls`);
        }
      });

    set({ ballot: newBallot, txId });
  }
}));

export default useBallotStore;
