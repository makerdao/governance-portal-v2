import create from 'zustand';
import omit from 'lodash/omit';
import { Ballot } from '../types/ballot';
import { PollComment } from 'modules/comments/types/pollComments';
import { sign } from 'modules/web3/helpers/sign';
import { Web3Provider } from '@ethersproject/providers';
import { fetchJson } from 'lib/fetchJson';

type Store = {
  ballot: Ballot;
  previousVotes: Ballot;
  comments: Partial<PollComment>[];
  setComments: (newComments: Partial<PollComment>[]) => void;
  updateComment: (comment: string, pollId: number) => void;
  txId: null | string;
  clearTx: () => void;
  addToBallot: (pollId: number, option: number | number[]) => void;
  removeFromBallot: (pollId: number) => void;
  updatePreviousVotes: () => void;
  clearBallot: () => void;
  signComments: (account: string, provider: Web3Provider) => Promise<void>;
  signedMessage: string;
};

const [useBallotStore, ballotApi] = create<Store>((set, get) => ({
  ballot: {},
  previousVotes: {},
  txId: null,
  comments: [],
  signedMessage: '',

  setComments: (newComments: Partial<PollComment>[]) => {
    set({ comments: newComments, signedMessage: '' });
  },

  updateComment: (text: string, pollId: number) => {
    const comments = get().comments;
    const exist = comments.find(i => i.pollId === pollId);

    set(state => ({
      signedMessage: '',
      comments: exist
        ? state.comments.map(comment => {
            if (comment.pollId === pollId) {
              return {
                ...comment,
                comment: text
              };
            } else {
              return comment;
            }
          })
        : [
            ...state.comments,
            {
              comment: text,
              pollId
            }
          ]
    }));
  },

  clearTx: () => {
    set({ txId: null });
  },

  addToBallot: (pollId, option: number | number[]) => {
    set(state => ({ ballot: { ...state.ballot, [pollId]: { ...state.ballot[pollId], option } } }));
  },

  removeFromBallot: pollId => {
    set(state => ({ ballot: omit(state.ballot, pollId) }));
  },

  updatePreviousVotes: () => {
    const ballot = get().ballot;
    const previousVotes = get().previousVotes;
    set({
      previousVotes: {
        ...previousVotes,
        ...ballot
      }
    });
  },

  clearBallot: () => {
    set({ ballot: {} });
  },

  signComments: async (account: string, provider: Web3Provider) => {
    const comments = get().comments;

    const data = await fetchJson('/api/comments/nonce', {
      method: 'POST',
      body: JSON.stringify({
        voterAddress: account
      })
    });

    console.log('NONCE', data);

    const signedMessage = comments.length > 0 ? await sign(account, data.nonce, provider) : '';

    set({
      signedMessage
    });
  }
}));

export default useBallotStore;
export { ballotApi };
